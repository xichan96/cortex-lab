export type VersionType = 'edit' | 'current' | 'history' | 'diff';

export interface VersionItem {
  id: string;
  type: VersionType;
  label: string;
  promptId?: string;
  draftId?: string;
  publishedId?: string;
  updatedAt?: string;
}

