import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { getAppDataServices } from "./index";
import type { Examinee, Screenshot } from "./data.types";


type VerificationContextType = {
  data: Screenshot[];
  warningData: Examinee | null;
  dialogOpen: boolean;
  warningDialogOpen:boolean;
  setDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setWarningDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setWarningData: React.Dispatch<React.SetStateAction<Examinee | null>>;
};

const VerificationContext = createContext<VerificationContextType | undefined>(undefined);

export const useVerification = () => {
  const context = useContext(VerificationContext);
  if (!context) {
    throw new Error("useVerification must be used within a VerificationProvider");
  }
  return context;
};

export const VerificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<Screenshot[]>([]);
  const [warningData, setWarningData] = useState<Examinee | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [warningDialogOpen, setWarningDialogOpen] = useState(false);
  const { examId, roomId } = useParams();
  const initialLoad = useRef(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
 
  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3");
    }, []);

  useEffect(() => {
    if (!examId || !roomId) return;

    const unsubscribe = getAppDataServices().getListenVerificationByRoomId(
      examId,
      roomId,
      (querySnapshot) => {
        if (initialLoad.current) {
          // first load: set all
          const allData: Screenshot[] = [];
          querySnapshot?.forEach((doc) => {
            allData.push({ ...(doc.data() as Screenshot), id: doc.id });
          });
          setData(allData);
          initialLoad.current = false;
        } else {
          // subsequent changes
          querySnapshot?.docChanges().forEach((change) => {
            if (change.type === "added") {
              const newDoc = { ...(change.doc.data() as Screenshot), id: change.doc.id };
              setData((prev) => [newDoc,...prev]);
              setDialogOpen(true); // only for new doc
               if (audioRef.current) {
                    audioRef.current.play().catch(console.warn);
                }
            }

            if (change.type === "modified") {
              setData((prev) =>
                prev.map((item) =>
                  item.id === change.doc.id
                    ? { ...(change.doc.data() as Screenshot), id: change.doc.id }
                    : item
                )
              );
            }

            if (change.type === "removed") {
              setData((prev) => prev.filter((item) => item.id !== change.doc.id));
            }
          });
        }
      }
    );

    return () => unsubscribe();
  }, [examId, roomId]);

  return (
    <VerificationContext.Provider value={{ data, dialogOpen, setDialogOpen, warningDialogOpen, setWarningDialogOpen, setWarningData, warningData }}>
      {children}
    </VerificationContext.Provider>
  );
};
