import type { LmsApiClient } from "./services.type";
import createEdunexApi from "./edunex";

async function getTokenFromStorage(lms: string): Promise<string | null> {
  const key = `${lms}-token`;
  
  if (typeof window !== "undefined" && window.sessionStorage) {
    return window.sessionStorage.getItem(key);
  }
  return null;
}

export function createLmsApi(lms:string): LmsApiClient {
  
    const key = lms.toLowerCase();
    const lmsGetToken = () => getTokenFromStorage(key);
    switch (key) {
      case "edunex":
      default:
        return createEdunexApi({ getToken: lmsGetToken });
    }
}



