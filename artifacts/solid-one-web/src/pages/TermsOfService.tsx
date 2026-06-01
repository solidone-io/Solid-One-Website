import { LegalDocumentPage } from "@/components/LegalDocumentPage";
import {
  TERMS_OF_SERVICE_BLOCKS,
  TERMS_OF_SERVICE_CLOSING,
  TERMS_OF_SERVICE_META,
} from "@/content/terms-of-service";

export default function TermsOfService() {
  return (
    <LegalDocumentPage
      title={TERMS_OF_SERVICE_META.title}
      effectiveDate={TERMS_OF_SERVICE_META.effectiveDate}
      lastUpdated={TERMS_OF_SERVICE_META.lastUpdated}
      blocks={TERMS_OF_SERVICE_BLOCKS}
      afterContact={
        <>
          <div className="legal-contact">
            <p className="legal-p text-justify whitespace-pre-wrap">
              Glider Web3 Solution Pvt. Ltd.{"\n"}
              Registered office: 541, K9, Kalinga Nagar, Bhubaneswar, 751003, India{"\n\n"}
              Email (legal):{" "}
              <a href="mailto:legal@glider.world" className="text-white/85 font-semibold hover:text-white underline underline-offset-2">
                legal@glider.world
              </a>
              {"\n"}
              Email (operations):{" "}
              <a href="mailto:operations@glider.world" className="text-white/85 font-semibold hover:text-white underline underline-offset-2">
                operations@glider.world
              </a>
            </p>
          </div>
          <p className="legal-p text-justify whitespace-pre-wrap">{TERMS_OF_SERVICE_CLOSING}</p>
        </>
      }
    />
  );
}
