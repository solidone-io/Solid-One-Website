import { LegalDocumentPage } from "@/components/LegalDocumentPage";
import { COOKIE_POLICY_BLOCKS, COOKIE_POLICY_CLOSING, COOKIE_POLICY_META } from "@/content/cookie-policy";

export default function CookiePolicy() {
  return (
    <LegalDocumentPage
      title={COOKIE_POLICY_META.title}
      effectiveDate={COOKIE_POLICY_META.effectiveDate}
      lastUpdated={COOKIE_POLICY_META.lastUpdated}
      blocks={COOKIE_POLICY_BLOCKS}
      afterContact={
        <>
          <div className="legal-contact">
            <p className="legal-p text-justify whitespace-pre-wrap">
              Glider Web3 Solution Pvt. Ltd.{"\n"}
              Registered office: 541, K9, Kalinga Nagar, Bhubaneswar, 751003, India{"\n\n"}
              Email (legal):{" "}
              <a href="mailto:legal@solidone.io" className="text-white/85 font-semibold hover:text-white underline underline-offset-2">
                legal@solidone.io
              </a>
              {"\n"}
              Email (operations):{" "}
              <a href="mailto:operations@solidone.io" className="text-white/85 font-semibold hover:text-white underline underline-offset-2">
                operations@solidone.io
              </a>
            </p>
          </div>
          <p className="legal-p text-justify whitespace-pre-wrap">{COOKIE_POLICY_CLOSING}</p>
        </>
      }
    />
  );
}
