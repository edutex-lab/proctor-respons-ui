import { doc, writeBatch } from "firebase/firestore";
import type { AppDataService, Examinee } from "./data.types";
import { db } from "../services/firebase";
import chunk from 'lodash/chunk';

export const firestoreDataService: AppDataService = {
    async setRoomForUsers(examId, roomId, users) {
        const chunkedUsers = chunk(users, 50);
        for (const chunk of chunkedUsers) {
            const batch = writeBatch(db);
            chunk.forEach((user: Examinee) => {
                const {lmsUserId, code, name} = user;
                const docRef = doc(db, 'exams', examId, 'users', lmsUserId);
                batch.set(docRef, {
                    roomId,
                    code,
                    name,
                },{merge:true});
            });
            await batch.commit();
        }
    },
}