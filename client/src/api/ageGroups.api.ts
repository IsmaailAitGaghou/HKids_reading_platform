import { API_ENDPOINTS } from "@/utils/constants";
import { get } from "@/api/client";

export interface AgeGroup {
   id: string;
   name: string;
   minAge: number;
   maxAge: number;
   description?: string;
   isActive: boolean;
   sortOrder: number;
}

interface AgeGroupsResponse {
   total: number;
   ageGroups: AgeGroup[];
}

export const listAgeGroups = async (): Promise<AgeGroupsResponse> => {
   return get<AgeGroupsResponse>(API_ENDPOINTS.AGE_GROUPS.BASE);
};

