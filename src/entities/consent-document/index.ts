export * from "./model/types";
export * from "./model/labels";
export {
  useConsentDocumentList,
  useConsentDocumentDetail,
  useCurrentConsentDocuments,
  flattenConsentDocumentPages,
  CONSENT_DOCUMENT_QUERY_KEYS,
} from "./model/use-consent-document";
export {
  getConsentDocuments,
  getConsentDocumentDetail,
  createConsentDocument,
  getCurrentConsentDocuments,
} from "./api";
