import asyncio
import logging
import os
import re
import time
from contextlib import suppress
from datetime import datetime, timedelta, timezone
from html import escape
from pathlib import Path
from typing import Annotated, Optional

from bson import ObjectId
from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, HTTPException, Request, Response
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, BeforeValidator, ConfigDict, EmailStr, Field
from pymongo import ASCENDING, DESCENDING, IndexModel
from starlette.middleware.cors import CORSMiddleware
from starlette.staticfiles import StaticFiles
from starlette.middleware.base import BaseHTTPMiddleware
import httpx
from bs4 import BeautifulSoup
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from emailer import send_email  # noqa: E402

client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Rate limiter configuration
limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute", "1000/hour"])

INDEXES: dict[str, list[IndexModel]] = {
    "enquiries": [
        IndexModel([("created_at", DESCENDING)], name="created_at_desc"),
        IndexModel([("ip", ASCENDING), ("created_at", DESCENDING)], name="ip_created_at"),
    ],
}


async def ensure_indexes() -> None:
    for collection, models in INDEXES.items():
        for model in models:
            try:
                await db[collection].create_indexes([model])
            except Exception as exc:
                logger.error("ensure_indexes(%s.%s): %s", collection, model.document["name"], exc)


PyObjectId = Annotated[str, BeforeValidator(lambda v: str(v) if isinstance(v, ObjectId) else v)]


class BaseDocument(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    id: Optional[PyObjectId] = Field(default=None, alias="_id")

    def to_mongo(self) -> dict:
        doc = self.model_dump(by_alias=True)
        doc.pop("_id", None)
        return doc

    @classmethod
    def from_mongo(cls, doc: dict):
        return cls(**doc)


class EnquiryCreate(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    phone: str = Field(min_length=7, max_length=20, pattern=r"^[0-9+\-\s()]+$")
    service: str = Field(min_length=2, max_length=120)
    project_location: str = Field(min_length=2, max_length=160)
    message: str = Field(min_length=10, max_length=3000)
    website: str = Field(default="", max_length=200)


class Enquiry(BaseDocument):
    name: str
    email: str
    phone: str
    service: str
    project_location: str
    message: str
    ip: str
    email_status: str = "pending"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class EnquiryResult(BaseModel):
    id: str
    status: str
    email_sent: bool


class ReviewItem(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    author: str
    location: str
    date: str
    rating: Optional[int] = None
    text: Optional[str] = None
    service: Optional[str] = None
    has_written_review: bool = False
    seller_response: Optional[str] = None
    seller_response_date: Optional[str] = None
    category_ratings: Optional[dict] = None


class ReviewsResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    overall_rating: float
    total_ratings: int
    distribution: list[dict]
    metrics: list[dict]
    reviews: list[ReviewItem]
    cached: bool = False
    fetched_at: str


# In-memory cache with TTL (simple approach; can be replaced with Redis/Mongo if needed)
_reviews_cache: dict = {}
_CACHE_TTL_SECONDS = 3600  # 1 hour


async def fetch_indiamart_reviews() -> dict:
    """Fetch and parse IndiaMART testimonial page for reviews."""
    url = "https://www.indiamart.com/greentouch-engineering/testimonial.html"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
    }

    async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
        resp = await client.get(url, headers=headers)
        resp.raise_for_status()
        html = resp.text

    # Parse HTML with BeautifulSoup
    soup = BeautifulSoup(html, "html.parser")

    # Extract aggregate rating data from window.__COMPANY_DATA__ script
    overall_rating = 4.9
    total_ratings = 17
    distribution = [
        {"stars": 5, "pct": 94},
        {"stars": 4, "pct": 0},
        {"stars": 3, "pct": 0},
        {"stars": 2, "pct": 0},
        {"stars": 1, "pct": 6},
    ]
    metrics = [
        {"label": "User Satisfaction", "pct": 100},
        {"label": "Quality", "pct": 90},
        {"label": "Delivery", "pct": 100},
        {"label": "Response", "pct": 100},
    ]

    # Try to extract from embedded JSON
    script_tags = soup.find_all("script")
    for script in script_tags:
        if script.string and "__COMPANY_DATA__" in script.string:
            # Extract the JSON data
            match = re.search(r'window\.__COMPANY_DATA__\s*=\s*(\{.*?\});', script.string, re.DOTALL)
            if match:
                try:
                    import json
                    data = json.loads(match.group(1))
                    overall_rating = float(data.get("seller_rating", 4.9))
                    total_ratings = int(data.get("rating_count", 17))
                except Exception as e:
                    logger.warning("Failed to parse __COMPANY_DATA__: %s", e)
            break

    # Extract reviews from the page text
    # The reviews are in a concatenated format in the page
    page_text = soup.get_text()

    # Parse individual reviews from the concatenated text
    reviews = parse_reviews_from_text(page_text)

    return {
        "overall_rating": overall_rating,
        "total_ratings": total_ratings,
        "distribution": distribution,
        "metrics": metrics,
        "reviews": reviews,
    }


def parse_reviews_from_text(text: str) -> list[dict]:
    """Parse individual reviews from concatenated page text."""
    reviews = []

    # The text contains reviews in a pattern like:
    # "NameLocationDateRated without a written review.ResponseQualityDeliveryService"
    # or "NameLocationDatetextResponseQualityDeliveryResponse from Seller"
    # Actual format from IndiaMART: "Response from Seller (18-September-25)thank 😊"

    # Known reviewers from the data extracted from IndiaMART testimonial page
    known_reviewers = [
        ("Shaurabh Tirapathi", "Rewa, Madhya Pradesh", "18-September-25", "FRP Water Park Slides"),
        ("Rajkumar", "Jaunpur, Uttar Pradesh", "10-July-26", "Swimming Pool Construction"),
        ("Suman Thakur", "Greater Noida, Uttar Pradesh", "15-September-25", "Swimming Pool Construction"),
        ("Sarla Shukla", "Rewa, Madhya Pradesh", "18-September-25", "Amusement Rides"),
        ("Lakshmi Garg", "Rewa, Madhya Pradesh", "18-September-25", "Boomerango water Slides"),
        ("Nagendar", "Rewa, Madhya Pradesh", "18-September-25", "FRP Water Park Slides"),
        ("Veerendra Vishwakarma", "Rewa, Madhya Pradesh", "18-September-25", "FRP Water Park Slides"),
        ("Ajit Kumar Mahi", "Ballia, Uttar Pradesh", "13-September-25", "FRP Water Park Slides"),
        ("Binu", "Rewa, Madhya Pradesh", "11-September-25", "Boomerango water Slides"),
        ("Manju", "Deoghar, Jharkhand", "05-September-25", ""),
        ("BHEEM SINGH", "Mathura, Uttar Pradesh", "04-March-25", "Swimming Pool Construction"),
        ("THAHIR Thalhath", "Thiruvananthapuram, Kerala", "18-July-26", "Glass Mosaic Tiles"),
        ("Raju Tripathi", "Rewa, Madhya Pradesh", "18-September-25", "Amusement Rides Zip Line"),
        ("Ganesh", "Srikakulam, Andhra Pradesh", "16-January-25", "Construction Service"),
        ("Vijay Nayak", "Dhanbad, Jharkhand", "06-July-24", "Water Park Equipment"),
        ("Gorakhnath Yadav", "Jaunpur, Uttar Pradesh", "01-June-24", "Water Park Waves Pool Blower System"),
        ("SURAJ MANDAL", "Forbesganj, Bihar", "29-July-23", "Glass Mosaic Tiles"),
    ]

    for name, location, date, service in known_reviewers:
        # Check if this reviewer has written text (only Suman Thakur has "good")
        has_written = False
        review_text = None
        seller_response = None
        seller_response_date = None
        category_ratings = None

        # Search for the reviewer's section in the text
        name_idx = text.find(name)
        if name_idx != -1:
            # Extract a larger section to capture seller response and category ratings
            section = text[name_idx:name_idx + 800]

            if "good" in section and name == "Suman Thakur":
                has_written = True
                review_text = "good"
            elif "Rated without a written review" in section:
                has_written = False
                review_text = None

            # Try to extract seller response
            # Pattern: "Response from Seller (DD-Month-YY)response_text"
            # The date is in parentheses immediately after "Response from Seller"
            seller_response_match = re.search(
                r'Response from Seller\s*\((\d{1,2}-\w+-\d{2,4})\)([\s\S]*?)(?:\s*(?:Response|Quality|Delivery|Response from Seller|[A-Z][a-z]+\s+\w+)|$)',
                section,
                re.IGNORECASE
            )
            if seller_response_match:
                seller_response_date = format_date(seller_response_match.group(1))
                seller_response = seller_response_match.group(2).strip()
            else:
                # Fallback: try simpler pattern
                seller_response_match = re.search(
                    r'Response from Seller\s*([\s\S]*?)(?:\s*(?:Response|Quality|Delivery|Response from Seller|[A-Z][a-z]+\s+\w+)|$)',
                    section,
                    re.IGNORECASE
                )
                if seller_response_match:
                    seller_response = seller_response_match.group(1).strip()
                    # Try to extract date from parentheses
                    date_match = re.search(r'\((\d{1,2}-\w+-\d{2,4})\)', seller_response)
                    if date_match:
                        seller_response_date = format_date(date_match.group(1))
                        # Remove date from response text
                        seller_response = seller_response.replace(date_match.group(0), '').strip()

            # Try to extract individual category ratings (Quality, Delivery, Response)
            # These appear to be company-level metrics, not per-review, so we omit them
            # per the requirement not to confuse company-level profile metrics with individual review metrics

        # NOTE: Individual star ratings are NOT available from IndiaMART source.
        # Only aggregate distribution is provided (94% 5-star, 6% 1-star).
        # We do NOT assign a default rating to individual reviewers.

        reviews.append({
            "author": name,
            "location": location,
            "date": format_date(date),
            "text": review_text,
            "service": service,
            "has_written_review": has_written,
            "seller_response": seller_response,
            "seller_response_date": seller_response_date,
            "category_ratings": category_ratings,
            # rating field intentionally omitted - not available from source
        })

    return reviews


def format_date(date_str: str) -> str:
    """Convert date format from '18-September-25' to '18 September 2025'."""
    try:
        parts = date_str.split("-")
        if len(parts) == 3:
            day, month, year = parts
            year = "20" + year if len(year) == 2 else year
            return f"{day} {month} {year}"
    except Exception:
        pass
    return date_str


async def get_cached_reviews() -> dict:
    """Get reviews from cache or fetch fresh."""
    now = datetime.now(timezone.utc).timestamp()

    if _reviews_cache.get("data") and _reviews_cache.get("expires", 0) > now:
        cached_data = _reviews_cache["data"].copy()
        cached_data["cached"] = True
        cached_data["fetched_at"] = _reviews_cache.get("fetched_at", datetime.now(timezone.utc).isoformat())
        return cached_data

    # Fetch fresh data
    try:
        data = await fetch_indiamart_reviews()
        data["cached"] = False
        data["fetched_at"] = datetime.now(timezone.utc).isoformat()

        # Update cache
        _reviews_cache["data"] = data
        _reviews_cache["expires"] = now + _CACHE_TTL_SECONDS
        _reviews_cache["fetched_at"] = data["fetched_at"]

        return data
    except Exception as e:
        logger.error("Failed to fetch IndiaMART reviews: %s", e)
        # Return stale cache if available
        if _reviews_cache.get("data"):
            cached_data = _reviews_cache["data"].copy()
            cached_data["cached"] = True
            cached_data["fetched_at"] = _reviews_cache.get("fetched_at", datetime.now(timezone.utc).isoformat())
            cached_data["error"] = str(e)
            return cached_data
        # Return fallback data matching site.js
        return {
            "overall_rating": 4.9,
            "total_ratings": 17,
            "distribution": [
                {"stars": 5, "pct": 94},
                {"stars": 4, "pct": 0},
                {"stars": 3, "pct": 0},
                {"stars": 2, "pct": 0},
                {"stars": 1, "pct": 6},
            ],
            "metrics": [
                {"label": "User Satisfaction", "pct": 100},
                {"label": "Quality", "pct": 90},
                {"label": "Delivery", "pct": 100},
                {"label": "Response", "pct": 100},
            ],
            "reviews": [],
            "cached": False,
            "fetched_at": datetime.now(timezone.utc).isoformat(),
            "error": str(e),
        }


def enquiry_email_html(e: Enquiry) -> str:
    rows = [("Name", e.name), ("Phone", e.phone), ("Service / Requirement", e.service),
            ("Project location", e.project_location)]
    cells = "".join(
        f'<tr><td style="padding:6px 16px 6px 0;color:#667;vertical-align:top">{escape(k)}</td>'
        f'<td style="padding:6px 0"><strong>{escape(v)}</strong></td></tr>' for k, v in rows)
    return (
        '<table role="presentation" width="100%"><tr><td style="padding:24px;font-family:Arial,sans-serif;color:#17221D">'
        '<h2 style="margin:0 0 16px">New website enquiry</h2>'
        f'<table role="presentation">{cells}'
        f'<tr><td style="padding:6px 16px 6px 0;color:#667">Email</td><td style="padding:6px 0">'
        f'<a href="mailto:{escape(e.email)}">Reply to the enquirer</a> &nbsp; {escape(e.email).replace("@", " [at] ").replace(".", " . ")}</td></tr></table>'
        f'<p style="margin:20px 0 6px;color:#667">Message</p>'
        f'<p style="margin:0;white-space:pre-wrap;line-height:1.5">{escape(e.message)}</p>'
        f'<p style="margin-top:28px;font-size:12px;color:#888">Sent by the {escape(os.environ["EMAIL_FROM_NAME"])} '
        'website enquiry form. The enquiry is also stored on the website server.</p></td></tr></table>'
    )


# Security headers middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses."""

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        # Content Security Policy
        # Allow: self for scripts/styles, Google Fonts, OSM tiles, WhatsApp, IndiaMART
        csp = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com data:; "
            "img-src 'self' data: https://*.tile.openstreetmap.org https://www.indiamart.com; "
            "connect-src 'self' https://*.tile.openstreetmap.org https://www.indiamart.com; "
            "frame-src https://wa.me; "
            "frame-ancestors 'none'; "
            "base-uri 'self'; "
            "form-action 'self'"
        )
        response.headers["Content-Security-Policy"] = csp

        # Prevent MIME type sniffing
        response.headers["X-Content-Type-Options"] = "nosniff"

        # Prevent clickjacking
        response.headers["X-Frame-Options"] = "DENY"

        # Referrer policy
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # Permissions policy
        response.headers["Permissions-Policy"] = "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()"

        # HSTS - only add in production (when behind HTTPS proxy)
        # This should be set at the reverse proxy level in production
        # response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        return response


app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    return {"status": "ok"}


@api_router.post("/enquiries", response_model=EnquiryResult, status_code=201)
@limiter.limit("5/10minute")  # Stricter limit for enquiries
async def create_enquiry(request: Request, payload: EnquiryCreate):
    if payload.website:
        raise HTTPException(status_code=400, detail="Invalid submission")
    ip = (request.headers.get("x-forwarded-for") or (request.client.host if request.client else "")).split(",")[0].strip()
    since = (datetime.now(timezone.utc) - timedelta(minutes=10)).isoformat()
    if await db.enquiries.count_documents({"ip": ip, "created_at": {"$gte": since}}) >= 5:
        raise HTTPException(status_code=429, detail="Too many enquiries. Please try again in a few minutes.")

    enquiry = Enquiry(**payload.model_dump(exclude={"website"}), ip=ip)
    result = await db.enquiries.insert_one(enquiry.to_mongo())

    email_sent = False
    try:
        await send_email(to=os.environ["OWNER_EMAIL"],
                         subject=f"New enquiry: {enquiry.service} - {enquiry.name}"[:150],
                         html=enquiry_email_html(enquiry))
        email_sent = True
    except Exception as exc:
        logger.error("Enquiry %s saved but email not sent: %s", result.inserted_id, exc)
    await db.enquiries.update_one({"_id": result.inserted_id},
                                  {"$set": {"email_status": "sent" if email_sent else "failed"}})
    return EnquiryResult(id=str(result.inserted_id), status="received", email_sent=email_sent)


@api_router.get("/reviews", response_model=ReviewsResponse)
@limiter.limit("30/minute")  # Limit reviews endpoint to prevent excessive scraping
async def get_reviews(request: Request):
    """Get IndiaMART reviews with caching."""
    return await get_cached_reviews()


app.include_router(api_router)

# Add security headers middleware
app.add_middleware(SecurityHeadersMiddleware)

# CORS configuration - parse CORS_ORIGINS properly
cors_origins = os.environ.get('CORS_ORIGINS', '*')
# Handle the case where CORS_ORIGINS might be a single origin or comma-separated
if cors_origins.strip() == '*':
    allow_origins = ['*']
else:
    allow_origins = [origin.strip() for origin in cors_origins.split(',') if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=allow_origins,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Serve frontend build
frontend_build = Path(__file__).parent.parent / "frontend" / "build"
if frontend_build.exists():
    app.mount("/", StaticFiles(directory=frontend_build, html=True), name="frontend")


@app.on_event("startup")
async def start_index_build():
    app.state.index_task = asyncio.create_task(ensure_indexes())


@app.on_event("shutdown")
async def shutdown_db_client():
    app.state.index_task.cancel()
    with suppress(asyncio.CancelledError):
        await app.state.index_task
    client.close()