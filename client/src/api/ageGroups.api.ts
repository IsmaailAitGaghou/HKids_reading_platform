import { API_ENDPOINTS } from "@/utils/constants";
import { del, get, patch, post } from "@/api/client";

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

export interface CreateAgeGroupRequest {
   name: string;
   minAge: number;
   maxAge: number;
   description?: string;
   isActive?: boolean;
   sortOrder?: number;
}

export interface UpdateAgeGroupRequest {
   name?: string;
   minAge?: number;
   maxAge?: number;
   description?: string;
   isActive?: boolean;
   sortOrder?: number;
}

export const listAgeGroups = async (): Promise<AgeGroupsResponse> => {
   return get<AgeGroupsResponse>(API_ENDPOINTS.AGE_GROUPS.BASE);
};

export const listPublicAgeGroups = async (): Promise<AgeGroupsResponse> => {
   return get<AgeGroupsResponse>(API_ENDPOINTS.AGE_GROUPS.PUBLIC);
};

export const createAgeGroup = async (
   data: CreateAgeGroupRequest
): Promise<AgeGroup> => {
   const response = await post<{ ageGroup: AgeGroup }, CreateAgeGroupRequest>(
      API_ENDPOINTS.AGE_GROUPS.BASE,
      data
   );
   return response.ageGroup;
};

export const updateAgeGroup = async (
   id: string,
   data: UpdateAgeGroupRequest
): Promise<AgeGroup> => {
   const response = await patch<{ ageGroup: AgeGroup }, UpdateAgeGroupRequest>(
      API_ENDPOINTS.AGE_GROUPS.BY_ID(id),
      data
   );
   return response.ageGroup;
};

export const deleteAgeGroup = async (id: string): Promise<void> => {
   await del(API_ENDPOINTS.AGE_GROUPS.BY_ID(id));
};
