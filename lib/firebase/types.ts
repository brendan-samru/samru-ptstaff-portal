// ---- Shared enums / helpers ----
export type Status = 'live' | 'disabled';

export type Role = 'manager' | 'superadmin';

// ---- Templates (Super Admin only) ----
export interface CardTemplate {
  id: string;                    // doc id
  title: string;
  description?: string;
  heroImageUrl?: string;
  iconKey?: string;              // to match your badges/icons if needed
  fields?: Record<string, unknown>;
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ---- Cards (Managers create from templates) ----
export interface Card {
  id: string;                    // doc id
  templateId: string;            // ref to cardTemplates/{id}
  headline: string;
  description?: string;
  heroImageUrl?: string;

  status: Status;                // 'live' | 'disabled'
  downloadable: boolean;         // lock/unlock downloads

  labelCount: number;            // (# live subcards + # live files)
  views: number;                 // optional analytics counter
  downloads: number;             // optional analytics counter

  createdBy: string;             // uid
  updatedBy: string;             // uid
  createdAt: Date;
  lastUpdated: Date;             // for the calendar icon on cards
}

// ---- Subcards (children of Cards) ----
export interface Subcard {
  id: string;                    // doc id
  headline: string;
  description?: string;
  imageUrl?: string;
  status: Status;
  order: number;                 // for manual sort
  lastUpdated: Date;
}

// ---- Files (children of Cards) ----
export interface FileItem {
  id: string;                    // doc id
  name: string;                  // display name
  storagePath: string;           // gs://orgs/{orgId}/cards/{cardId}/uploads/...
  size: number;                  // bytes
  contentType: string;
  status: Status;
  lastUpdated: Date;
}
