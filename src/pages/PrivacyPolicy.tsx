import { LegalDocumentPage } from "@/components/LegalDocumentPage";
import { PRIVACY_POLICY_BLOCKS, PRIVACY_POLICY_CLOSING, PRIVACY_POLICY_META } from "@/content/privacy-policy";

export default function PrivacyPolicy() {
  return (
    <LegalDocumentPage
      title={PRIVACY_POLICY_META.title}
      effectiveDate={PRIVACY_POLICY_META.effectiveDate}
      lastUpdated={PRIVACY_POLICY_META.lastUpdated}
      blocks={PRIVACY_POLICY_BLOCKS}
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
          <p className="legal-p text-justify whitespace-pre-wrap">{PRIVACY_POLICY_CLOSING}</p>
        </>
      }
    />
  );
}
