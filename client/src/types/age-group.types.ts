export interface AgeGroup {
  id: string;
  name: string;
  minAge: number;
  maxAge: number;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}
