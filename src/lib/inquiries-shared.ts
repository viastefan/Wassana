/** Client-safe contact-inquiry types (no Node/fs). */

export type InquiryStatus = "new" | "open" | "done";

export type InquirySource =
  | "website"
  | "kontakt"
  | "kochkurs"
  | "catering"
  | string;

export type ContactInquiry = {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  source: InquirySource;
  /** Convenience flag for unread badge (true once opened / marked). */
  read: boolean;
  status: InquiryStatus;
  /** Private admin notes — never shown on the public site. */
  notes: string;
  archived: boolean;
  archivedAt: string | null;
  mailOwnerSent: boolean;
  mailGuestSent: boolean;
};

export type InquiryStore = {
  inquiries: ContactInquiry[];
  updatedAt: string;
};

export const INQUIRY_STATUSES: InquiryStatus[] = ["new", "open", "done"];

export function inquiryStatusLabel(status: InquiryStatus): string {
  switch (status) {
    case "new":
      return "Neu";
    case "open":
      return "In Bearbeitung";
    case "done":
      return "Erledigt";
    default:
      return status;
  }
}

export function inquirySourceLabel(source: string): string {
  switch (source) {
    case "kontakt":
      return "Kontakt";
    case "kochkurs":
      return "Kochkurs";
    case "catering":
      return "Catering";
    case "website":
      return "Website";
    default:
      return source || "Website";
  }
}
