import type { AxiosInstance } from "axios";

export interface LmsApiEndpoints {
  profile: string;
  examinees: string;
  exams: string;
  examineeInfo: string;
}

export interface LmsApiClient {
  client: AxiosInstance;
  baseURL: string;
  endpoints: LmsApiEndpoints;
}

export type CreateLmsApiParams = {
  getToken?: () => Promise<string | null> | string | null;
};


