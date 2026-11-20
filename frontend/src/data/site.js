// Single source of truth for all site content. Edit here; no component changes needed.
export const INDIAMART_URL = "https://www.indiamart.com/greentouch-engineering/";
export const INDIAMART_REVIEWS_URL = "https://www.indiamart.com/greentouch-engineering/testimonial.html";

export const COMPANY = {
  name: "Green Touch Engineering Private Limited",
  short: "Green Touch Engineering",
  location: "Rewa, Madhya Pradesh, India",
  phones: [
    { label: "+91 9473448022", href: "tel:+919473448022" },
    { label: "+91 9631657314", href: "tel:+919631657314" },
  ],
  email: "greentouchengineering5@gmail.com",
  hours: [
    { day: "Monday – Friday", time: "9:00 AM – 6:00 PM IST" },
    { day: "Saturday", time: "10:00 AM – 2:00 PM IST" },
    { day: "Sunday", time: "Closed" },
  ],
  mapEmbed: "https://www.openstreetmap.org/export/embed.html?bbox=81.18%2C24.45%2C81.42%2C24.62&layer=mapnik",
  mapLink: "https://www.google.com/maps/search/?api=1&query=Rewa%2C+Madhya+Pradesh%2C+India",
};

// Set `url` to the official profile link to activate an icon. Unknown links stay null (never invented).
export const SOCIALS = [
  { id: "instagram", label: "Instagram", url: "https://www.instagram.com/greentouchengineering.pvt.ltd?obrf=Yzl4MHRneXg0aGZk" },
  { id: "facebook", label: "Facebook", url: "https://www.facebook.com/share/1H5B1s7UdJ/" },
  { id: "whatsapp", label: "WhatsApp", url: "https://wa.me/919473448022" },
  { id: "indiamart", label: "IndiaMART", url: INDIAMART_URL },
];

export const NAV = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "services", label: "Services" },
  { id: "solutions", label: "Solutions" },
  { id: "process", label: "Process" },
];
export const NAV_MORE = [
  { id: "capabilities", label: "Technical Capabilities" },
  { id: "reviews", label: "IndiaMART Verified Reviews" },
  { id: "location", label: "Location & Contact" },
];

export const IMAGE_NOTE = "Catalogue image from the company's IndiaMART listing";

export const HERO_FACTS = [
  { k: "BASE", v: "Rewa, Madhya Pradesh" },
  { k: "ESTABLISHED", v: "2022" },
  { k: "TEAM", v: "11–25 people" },
  { k: "FOCUS", v: "Water recreation engineering" },
];

export const MARQUEE = [
  "Water Park Construction", "Swimming Pools", "Slides & Attractions",
  "Filtration Systems", "Water Park Equipment", "Recreational Infrastructure",
];

// Listed on the company's IndiaMART profile.
export const PROFILE_FACTS = [
  { k: "Nature of business", v: "Service Provider" },
  { k: "Legal status", v: "Limited Company" },
  { k: "Established", v: "2022" },
  { k: "Team size", v: "11 to 25 people" },
  { k: "GST number", v: "23AAMCG0534C1Z5" },
  { k: "IndiaMART certification", v: "TrustSEAL verified" },
];

export const SERVICES = [
  { code: "SRV-01", tag: "Infrastructure", title: "Water Park Construction", image: "/images/waterpark.jpg",
    desc: "Planning and construction-related solutions for water-based recreational infrastructure." },
  { code: "SRV-02", tag: "Aquatics", title: "Swimming Pool Construction", image: "/images/pool.jpg",
    desc: "Swimming pool construction and related engineering solutions." },
  { code: "SRV-03", tag: "Attractions", title: "Water Slides & Attractions", image: "/images/close-body.jpg",
    desc: "Water slides, recreational attractions and associated infrastructure." },
  { code: "SRV-04", tag: "Water quality", title: "Water Filtration Systems", image: null,
    desc: "Filtration and water treatment-related systems." },
  { code: "SRV-05", tag: "Equipment", title: "Water Park Equipment", image: "/images/frp-equipment.jpg",
    desc: "Equipment and related infrastructure for recreational water facilities." },
  { code: "SRV-06", tag: "Recreation", title: "Amusement & Recreational Infrastructure", image: "/images/playground.jpg",
    desc: "Related amusement and attraction engineering solutions." },
];

export const SOLUTION_FILTERS = [
  { id: "all", label: "All" },
  { id: "slides", label: "Water Slides" },
  { id: "pool", label: "Swimming Pool Systems" },
  { id: "attractions", label: "Water Park Attractions" },
  { id: "recreation", label: "Recreational Equipment" },
];

// Names follow the company's IndiaMART listings. No specifications are stated: the company must supply them.
export const SOLUTIONS = [
  { id: "aqua-funnel", cat: "slides", title: "FRP Aqua Funnel Water Slide", image: "/images/funnel.jpg",
    desc: "A funnel-format FRP slide attraction for water parks." },
  { id: "aqua-loop", cat: "slides", title: "FRP Aqua Loop Water Slide", image: "/images/aqua-loop.jpg",
    desc: "A looping FRP raft slide configuration for water park layouts." },
  { id: "combination", cat: "slides", title: "FRP Combination Water Slides", image: "/images/combo-slides.jpg",
    desc: "Several slide formats combined around a shared tower." },
  { id: "speed", cat: "slides", title: "Speed Water Slide", image: "/images/speed-slide.jpg",
    desc: "A straight, steep slide format for water parks." },
  { id: "close-body", cat: "slides", title: "FRP Close Body Slide", image: "/images/close-body.jpg",
    desc: "An enclosed-tube FRP body slide." },
  { id: "aqua-drop", cat: "slides", title: "FRP Aqua Drop Slide", image: "/images/aqua-drop.jpg",
    desc: "A drop-launch slide format listed under straight water slides." },
  { id: "family", cat: "slides", title: "Family Water Park Slide", image: "/images/family-slide.jpg",
    desc: "A wide multi-lane slide intended for family use." },
  { id: "pool-work", cat: "pool", title: "Swimming Pool Construction Work", image: "/images/pool.jpg",
    desc: "Construction work for swimming pools, from structure to finishing." },
  { id: "swimming-pool-1", cat: "pool", title: "Swimming Pool", image: "/images/add1.jpg",
    desc: "Swimming pool design and construction solutions." },
  { id: "swimming-pool-2", cat: "pool", title: "Swimming Pool", image: "/images/add2.webp",
    desc: "Swimming pool construction and finishing solutions." },
  { id: "swimming-pool-3", cat: "pool", title: "Swimming Pool", image: "/images/add3.jpg",
    desc: "Complete swimming pool engineering and installation." },
  { id: "rain-dance", cat: "attractions", title: "Octopus Rain Dance", image: "/images/rain-dance.jpg",
    desc: "An octopus-themed rain dance water feature." },
  { id: "mushroom", cat: "attractions", title: "Water Park Mushroom Umbrella", image: "/images/umbrella.jpg",
    desc: "A mushroom-form water umbrella for splash and play pools." },
  { id: "frp-equipment", cat: "attractions", title: "FRP Multicolor Water Park Equipment", image: "/images/frp-equipment.jpg",
    desc: "Multicolour FRP play structures and equipment for water parks." },
  { id: "playground", cat: "recreation", title: "Outdoor Playground Equipment", image: "/images/playground.jpg",
    desc: "Outdoor play structures for recreational spaces." },
  { id: "zipline", cat: "recreation", title: "Amusement Rides Zip Line", image: "/images/zipline.jpg",
    desc: "Zip line amusement ride installations." },
];

// Proposed presentation stages; editable and subject to company approval.
export const PROCESS = [
  { title: "Initial Consultation", desc: "A first conversation about the site, the idea and what the project needs to achieve." },
  { title: "Requirement Understanding", desc: "Requirements, constraints and priorities are gathered and confirmed with you." },
  { title: "Planning & Design", desc: "The layout, the attraction mix and the supporting systems are planned." },
  { title: "Engineering & Coordination", desc: "Engineering details are worked through and coordinated across the scope of work." },
  { title: "Execution & Installation", desc: "Construction and equipment installation are carried out on site." },
  { title: "Handover & Support", desc: "The completed work is handed over, with support for questions that follow." },
];

export const CAPABILITIES = [
  { code: "CAP-01", title: "Water Infrastructure", area: "a", diagram: true,
    items: ["Water park construction", "Pools, basins and water features", "Site-level water layouts"] },
  { code: "CAP-02", title: "Filtration Systems", area: "b",
    items: ["Filtration-related services"] },
  { code: "CAP-03", title: "Pool Engineering", area: "c",
    items: ["Pool construction work"] },
  { code: "CAP-04", title: "Attraction Equipment", area: "d",
    items: ["FRP water slides", "Rain dance features", "Water umbrellas"] },
  { code: "CAP-05", title: "Installation & Coordination", area: "e",
    items: ["On-site installation of slides and equipment", "Coordination between civil work and equipment"] },
  { code: "CAP-06", title: "Recreational Infrastructure", area: "f",
    items: ["Outdoor playground equipment", "Zip line rides", "Amusement park equipment"] },
];

// Source: IndiaMART business profile. Not independently audited.
export const RATING = {
  score: 4.9, count: 17,
  distribution: [{ stars: 5, pct: 94 }, { stars: 4, pct: 0 }, { stars: 3, pct: 0 }, { stars: 2, pct: 0 }, { stars: 1, pct: 6 }],
  metrics: [
    { label: "User Satisfaction", pct: 100 },
    { label: "Quality", pct: 90 },
    { label: "Delivery", pct: 100 },
    { label: "Response", pct: 100 },
  ],
};

// Individual client reviews with verified feedback.
// Only reviews with written feedback are included here.
// Ratings without written reviews (star-only) are tracked separately in RATING.ratedFor.
export const REVIEWS = [
  {
    id: "review-1",
    author: "Verified buyer",
    location: "Greater Noida, Uttar Pradesh",
    date: "15 September 2025",
    rating: 5,
    text: "good",
    // No client photo available — initials-based avatar will be used.
    hasPhoto: false,
  },
  // Additional verified reviews can be added here as they become available.
  // Structure: { id, author, location, date, rating (1-5), text, hasPhoto, photoUrl? }
];

// Star-only ratings (no written feedback) from IndiaMART profile.
export const RATED_FOR = [
  "FRP Water Park Slides",
  "Swimming Pool Construction",
  "Boomerango Water Slides",
  "Amusement Rides",
  "Water Park Equipment",
  "Amusement Rides Zip Line",
  "Construction Service",
];

export const ENQUIRY_SERVICES = [...SERVICES.map((s) => s.title), "Other / Not sure yet"];

export const LEGAL = {
  privacy: { title: "Privacy Policy", body: [
    "When you submit the enquiry form, the name, email address, phone number, project location and message you provide are stored on this website's server and emailed to Green Touch Engineering Private Limited so that the team can respond.",
    "This information is used only to respond to your enquiry. To ask for your enquiry details to be corrected or deleted, write to greentouchengineering5@gmail.com.",
    "The contact section loads a map from OpenStreetMap, which may receive your IP address when the map is displayed." ] },
  terms: { title: "Terms & Conditions", body: [
    "The content of this website is provided for general information about the services of Green Touch Engineering Private Limited. It does not constitute an offer or a contract.",
    "Scope, pricing, timelines and deliverables for any project are agreed separately in writing between the company and the client." ] },
  disclaimer: { title: "Disclaimer", body: [
    "Images on this website are catalogue images from the company's IndiaMART listings and are shown for illustration. They are not presented as records of specific completed projects.",
    "Ratings and profile metrics are quoted from the company's IndiaMART business profile and have not been independently audited.",
    "The process stages and capability groupings describe a general approach and may vary from project to project." ] },
};