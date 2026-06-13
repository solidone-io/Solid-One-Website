import { FaGithub, FaLinkedin, FaTelegram, FaXTwitter, FaYoutube } from "react-icons/fa6";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { FooterDisclaimer } from "@/components/FooterDisclaimer";
import logoImg from "@assets/solid-one-logo.png";

const FOOTER_COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Platform", href: "/#product" },
      { label: "Real World Assets", href: "/#rwa" },
      { label: "Payments", href: "/#infrastructure" },
      { label: "Security", href: "/#security" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Support", href: "/support" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Documentation", href: "/developers" },
      { label: "API", href: "/developers" },
      { label: "GitHub", href: "/developers" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy policy", href: "/privacy" },
      { label: "Term of service", href: "/terms" },
      { label: "Cookie policy", href: "/cookies" },
    ],
  },
];

const SOCIAL_LINKS = [
  { icon: FaXTwitter, label: "X", href: "https://x.com/solidone_co" },
  { icon: FaLinkedin, label: "LinkedIn", href: "https://www.linkedin.com/company/solid-one-io/" },
  { icon: FaTelegram, label: "Telegram", href: "https://t.me/+U3mdhWkbNcFmYTI8" },
  { icon: FaGithub, label: "GitHub", href: "https://github.com/Solid-One" },
  { icon: FaYoutube, label: "YouTube", href: "https://www.youtube.com/channel/UCO0sWggaUEz3aejQKl-dODA" },
];

export function SiteFooter() {
  return (
    <footer className="px-4 md:px-10 pb-8 md:pb-10 pt-4">
      <div className="max-w-7xl mx-auto bg-white text-black rounded-[28px] px-6 py-10 md:px-12 md:py-12">
        {/* Logo + newsletter — mobile / tablet */}
        <div className="flex flex-col gap-5 max-md:gap-4 mb-12 md:mb-14 lg:hidden">
          <div className="flex flex-col gap-5 shrink-0 max-md:items-center md:items-start">
            <a href="/" className="max-md:mx-auto md:mx-0">
              <img src={logoImg} alt="Solid One" className="h-8 w-auto brightness-0" draggable={false} />
            </a>
            <div className="flex items-center gap-4 max-md:justify-center">
              {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-black hover:text-black/70 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
          <div className="w-full min-w-0 max-md:-mx-2 max-md:w-[calc(100%+1rem)]">
            <NewsletterSignup />
          </div>
        </div>

        {/* Logo + newsletter — desktop (email starts at Company column) */}
        <div className="mb-14 hidden lg:grid lg:grid-cols-4 lg:gap-x-10 lg:items-start">
          <div className="flex flex-col gap-5">
            <a href="/">
              <img src={logoImg} alt="Solid One" className="h-8 w-auto brightness-0" draggable={false} />
            </a>
            <div className="flex items-center gap-4">
              {SOCIAL_LINKS.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-black hover:text-black/70 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
          <div className="col-span-3 min-w-0 pr-10">
            <NewsletterSignup />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-[15px] font-semibold text-black mb-4">{col.title}</h4>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-[14px] text-black/65 hover:text-black transition-colors font-light">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <FooterDisclaimer />
    </footer>
  );
}
