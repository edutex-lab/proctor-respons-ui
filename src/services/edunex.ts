import axios from "axios";
import { type LmsApiClient, type CreateLmsApiParams } from "./services.type";

export const baseURL = (import.meta as any)?.env?.VITE_EDUNEX_API_BASE_URL || "https://api-edunex.cognisia.id";

export function createEdunexApi({ getToken }: CreateLmsApiParams): LmsApiClient {
  const client = axios.create({ baseURL });

  // Attach bearer token if provided (guard if interceptors not present)
  if (client && client.interceptors && client.interceptors.request && typeof client.interceptors.request.use === "function") {
    client.interceptors.request.use(async (config: any) => {
      const token = typeof getToken === "function" ? await getToken() : getToken ?? null;
      if (token) {
        config.headers = (config.headers ?? {}) as Record<string, string>;
        (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
      }
      return config;
    });
  }

  return {
    client,
    baseURL,
    endpoints: {
      profile: "/login/me",
      examinees:"/course/students",
      exams: "/exam/exams/:examId",
    },
  };
}

export default createEdunexApi;

