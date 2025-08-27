import type { AppDataService, LMSDataService } from "./data.types";
import { edunexDataServices } from "./edunexDataService";
import { firestoreDataService } from "./firestoreDataService";

// get data service based on lms value on session storage
export const getLMSDataService = (): LMSDataService => {
  const lms = sessionStorage.getItem('lms');
  switch (lms) {
    case 'edunex':
    default:
      return edunexDataServices;
  }
};

export const getAppDataServices = (): AppDataService => {
  return firestoreDataService
};