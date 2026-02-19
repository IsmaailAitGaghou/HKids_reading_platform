import { API_ENDPOINTS } from "@/utils/constants";
import { del, get, patch, post } from "@/api/client";
import type {
  AnalyticsQuery,
  Child,
  ChildAnalyticsResponse,
  CreateChildRequest,
  Policy,
  UpdateChildRequest,
  UpdatePolicyRequest,
} from "@/types/child.types";

interface ChildrenResponse {
  total: number;
  children: Child[];
}

interface ChildResponse {
  child: Child;
}

interface PolicyResponse {
  policy: Policy;
}

export const listChildren = async (): Promise<ChildrenResponse> => {
  return get<ChildrenResponse>(API_ENDPOINTS.PARENT.CHILDREN);
};

export const getChildById = async (id: string): Promise<Child> => {
  const response = await get<ChildResponse>(API_ENDPOINTS.PARENT.CHILD_BY_ID(id));
  return response.child;
};

export const createChild = async (data: CreateChildRequest): Promise<Child> => {
  const response = await post<{ child: Child }, CreateChildRequest>(
    API_ENDPOINTS.PARENT.CHILDREN,
    data
  );
  return response.child;
};

export const updateChild = async (
  id: string,
  data: UpdateChildRequest
): Promise<Child> => {
  const response = await patch<{ child: Child }, UpdateChildRequest>(
    API_ENDPOINTS.PARENT.CHILD_BY_ID(id),
    data
  );
  return response.child;
};

export const deleteChild = async (id: string): Promise<void> => {
  await del(API_ENDPOINTS.PARENT.CHILD_BY_ID(id));
};

export const getChildPolicy = async (id: string): Promise<Policy> => {
  const response = await get<PolicyResponse>(API_ENDPOINTS.PARENT.CHILD_POLICY(id));
  return response.policy;
};

export const updateChildPolicy = async (
  id: string,
  data: UpdatePolicyRequest
): Promise<Policy> => {
  const response = await patch<PolicyResponse, UpdatePolicyRequest>(
    API_ENDPOINTS.PARENT.CHILD_POLICY(id),
    data
  );
  return response.policy;
};

export const getChildAnalytics = async (
  id: string,
  query?: AnalyticsQuery
): Promise<ChildAnalyticsResponse> => {
  return get<ChildAnalyticsResponse>(API_ENDPOINTS.PARENT.CHILD_ANALYTICS(id), {
    params: query,
  });
};
