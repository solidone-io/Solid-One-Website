import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  type CookieConsentChoice,
  getCookieConsent,
  setCookieConsent,
} from "@/lib/cookie-consent";

export function CookieConsent() {
  const [location] = useLocation();
  const [visible, setVisible] = useState(false);

  const isAdmin = location === "/admin1855" || location.startsWith("/admin1855/");

  useEffect(() => {
    if (isAdmin) {
      setVisible(false);
      return;
    }
    setVisible(getCookieConsent() === null);
  }, [isAdmin]);

  const choose = (choice: CookieConsentChoice) => {
    setCookieConsent(choice);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-labelledby="cookie-consent-title"
          aria-describedby="cookie-consent-desc"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed z-[100] bottom-4 left-4 right-4 flex justify-center sm:left-auto sm:right-6 sm:bottom-6 sm:block sm:w-[340px] sm:max-w-none"
        >
          <div className="w-full max-w-[340px] sm:max-w-none rounded-2xl border border-white/12 bg-[#0a0a0a]/95 backdrop-blur-md shadow-[0_8px_40px_rgba(0,0,0,0.55)] px-4 py-4 sm:px-5 sm:py-5">
            <p id="cookie-consent-title" className="text-[14px] font-semibold text-white mb-2">
              We use cookies
            </p>
            <p id="cookie-consent-desc" className="text-[12px] leading-relaxed text-white/60 mb-4">
              Essential cookies keep the site running. Optional cookies help us improve your experience. Read our{" "}
              <Link href="/cookies" className="text-white/85 underline underline-offset-2 hover:text-white">
                Cookie Policy
              </Link>
              .
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => choose("accepted")}
                className="h-9 w-full rounded-[9px] bg-white text-black text-[13px] font-semibold hover:bg-white/90 transition-colors"
              >
                Accept all
              </button>
              <button
                type="button"
                onClick={() => choose("rejected")}
                className="h-9 w-full rounded-[9px] border border-white/20 text-[13px] font-semibold text-white/80 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                Reject non-essential
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
