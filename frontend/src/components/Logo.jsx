export const LogoMark = ({ className = "h-[18px] w-[18px]", theme = "light" }) => (
  <img
    src={theme === "dark" ? "/white-logo.svg" : "/logo.svg"}
    alt="Green Touch Engineering"
    aria-hidden="true"
    className={className}
    style={{
      width: "auto",
      height: "auto",
      maxWidth: "100%",
      maxHeight: "100%",
      objectFit: "contain",
      display: "block",
    }}
  />
);

export const Logo = ({ compact, theme = "light" }) => (
  <span className="flex items-center gap-3">
    <LogoMark theme={theme} className="h-[18px] w-[18px]" />
    <span className="leading-none">
      <span className="block font-serif text-[1.35rem] font-semibold tracking-tight">Green Touch</span>
      {!compact && <span className="label mt-1 block !text-[0.62rem] text-muted-foreground">Engineering Pvt. Ltd.</span>}
    </span>
  </span>
);