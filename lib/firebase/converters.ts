import {
  CardTemplate, Card, Subcard, FileItem
} from './types';

const toDate = (ts: any) => (ts?.toDate ? ts.toDate() : ts ?? null);

export const cardTemplateConverter = {
  toFirestore: (data: Omit<CardTemplate, 'id'>) => data,
  fromFirestore: (snap: any) => {
    const d = snap.data();
    return {
      id: snap.id,
      title: d.title,
      description: d.description ?? '',
      heroImageUrl: d.heroImageUrl ?? '',
      iconKey: d.iconKey ?? '',
      fields: d.fields ?? {},
      isArchived: !!d.isArchived,
      createdAt: toDate(d.createdAt),
      updatedAt: toDate(d.updatedAt),
    } as CardTemplate;
  },
};

export const cardConverter = {
  toFirestore: (data: Omit<Card, 'id'>) => data,
  fromFirestore: (snap: any) => {
    const d = snap.data();
    return {
      id: snap.id,
      templateId: d.templateId,
      headline: d.headline,
      description: d.description ?? '',
      heroImageUrl: d.heroImageUrl ?? '',
      status: d.status,
      downloadable: !!d.downloadable,
      labelCount: d.labelCount ?? 0,
      views: d.views ?? 0,
      downloads: d.downloads ?? 0,
      createdBy: d.createdBy,
      updatedBy: d.updatedBy,
      createdAt: toDate(d.createdAt),
      lastUpdated: toDate(d.lastUpdated),
    } as Card;
  },
};

export const subcardConverter = {
  toFirestore: (data: Omit<Subcard, 'id'>) => data,
  fromFirestore: (snap: any) => {
    const d = snap.data();
    return {
      id: snap.id,
      headline: d.headline,
      description: d.description ?? '',
      imageUrl: d.imageUrl ?? '',
      status: d.status,
      order: d.order ?? 0,
      lastUpdated: toDate(d.lastUpdated),
    } as Subcard;
  },
};

export const fileItemConverter = {
  toFirestore: (data: Omit<FileItem, 'id'>) => data,
  fromFirestore: (snap: any) => {
    const d = snap.data();
    return {
      id: snap.id,
      name: d.name,
      storagePath: d.storagePath,
      size: d.size ?? 0,
      contentType: d.contentType ?? 'application/octet-stream',
      status: d.status,
      lastUpdated: toDate(d.lastUpdated),
    } as FileItem;
  },
};
