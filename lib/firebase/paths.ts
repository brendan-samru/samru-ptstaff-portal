export const orgPath = (orgId: string) => `orgs/${orgId}`;

export const cardTemplatesPath = (orgId: string) =>
  `${orgPath(orgId)}/cardTemplates`;

export const cardsPath = (orgId: string) =>
  `${orgPath(orgId)}/cards`;

export const subcardsPath = (orgId: string, cardId: string) =>
  `${cardsPath(orgId)}/${cardId}/subcards`;

export const filesPath = (orgId: string, cardId: string) =>
  `${cardsPath(orgId)}/${cardId}/files`;
