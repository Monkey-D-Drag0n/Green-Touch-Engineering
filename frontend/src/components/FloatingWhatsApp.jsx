const WHATSAPP_PHONE = "919473448022";
const WHATSAPP_MESSAGE = "Hello Green Touch Engineering, I would like to know more about your services.";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

export const FloatingWhatsApp = () => (
  <a
    href={WHATSAPP_URL}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Chat with Green Touch Engineering on WhatsApp"
    title="Chat with Green Touch Engineering on WhatsApp"
    data-testid="floating-whatsapp"
    className="fixed bottom-6 right-6 z-[55] lg:bottom-8 lg:right-8"
  >
    <button
      type="button"
      className="flex h-14 w-14 lg:h-[56px] lg:w-[56px] items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/50"
      aria-label="Chat with Green Touch Engineering on WhatsApp"
    >
      <img
        src="/whatsapp.svg"
        alt=""
        aria-hidden="true"
        className="h-7 w-7 lg:h-8 lg:w-8"
        decoding="async"
      />
    </button>
  </a>
);