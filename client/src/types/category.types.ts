export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  isActive: boolean;
  sortOrder: number;
}
