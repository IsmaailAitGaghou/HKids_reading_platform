import { API_ENDPOINTS } from '@/utils/constants';
import { get, post, patch, del } from '@/api/client';
import type {
  ChildProfile,
  CreateChildRequest,
  UpdateChildRequest,
  ChildPolicy,
  UpdatePolicyRequest,
  ChildAnalytics,
  AnalyticsQuery,
} from '@/types/child.types';

/**
 * List all children for the authenticated parent
 */
export const listChildren = async (): Promise<ChildProfile[]> => {
  const response = await get<ChildProfile[]>(API_ENDPOINTS.PARENT.CHILDREN);
  return response.data;
};

/**
 * Get a single child by ID
 */
export const getChildById = async (id: string): Promise<ChildProfile> => {
  const response = await get<ChildProfile>(API_ENDPOINTS.PARENT.CHILD_BY_ID(id));
  return response.data;
};

/**
 * Create a new child profile
 */
export const createChild = async (data: CreateChildRequest): Promise<ChildProfile> => {
  const response = await post<ChildProfile, CreateChildRequest>(
    API_ENDPOINTS.PARENT.CHILDREN,
    data
  );
  return response.data;
};

/**
 * Update a child profile
 */
export const updateChild = async (
  id: string,
  data: UpdateChildRequest
): Promise<ChildProfile> => {
  const response = await patch<ChildProfile, UpdateChildRequest>(
    API_ENDPOINTS.PARENT.CHILD_BY_ID(id),
    data
  );
  return response.data;
};

/**
 * Delete a child profile
 */
export const deleteChild = async (id: string): Promise<void> => {
  await del(API_ENDPOINTS.PARENT.CHILD_BY_ID(id));
};

/**
 * Get child's policy (reading restrictions)
 */
export const getChildPolicy = async (id: string): Promise<ChildPolicy> => {
  const response = await get<ChildPolicy>(API_ENDPOINTS.PARENT.CHILD_POLICY(id));
  return response.data;
};

/**
 * Update child's policy
 */
export const updateChildPolicy = async (
  id: string,
  data: UpdatePolicyRequest
): Promise<ChildPolicy> => {
  const response = await patch<ChildPolicy, UpdatePolicyRequest>(
    API_ENDPOINTS.PARENT.CHILD_POLICY(id),
    data
  );
  return response.data;
};

/**
 * Get child's reading analytics
 */
export const getChildAnalytics = async (
  id: string,
  query?: AnalyticsQuery
): Promise<ChildAnalytics> => {
  const response = await get<ChildAnalytics>(
    API_ENDPOINTS.PARENT.CHILD_ANALYTICS(id),
    { params: query }
  );
  return response.data;
};
