// Age Group Types
export interface AgeGroup {
  id: string;
  name: string;
  slug: string;
  description?: string;
  minAge: number;
  maxAge: number;
  icon?: string;
  color?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgeGroupRequest {
  name: string;
  description?: string;
  minAge: number;
  maxAge: number;
  icon?: string;
  color?: string;
  order?: number;
}

export interface UpdateAgeGroupRequest {
  name?: string;
  description?: string;
  minAge?: number;
  maxAge?: number;
  icon?: string;
  color?: string;
  order?: number;
  isActive?: boolean;
}
