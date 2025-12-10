import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc, where, writeBatch } from "firebase/firestore";
import type { AppDataService, Examinee, } from "./data.types";
import { db } from "../services/firebase";
import chunk from 'lodash/chunk';

export const firestoreDataService: AppDataService = {
    async setRoomForUsers(examId, roomId, users) {
        const chunkedUsers = chunk(users, 50);
        for (const chunk of chunkedUsers) {
            const batch = writeBatch(db);
            chunk.forEach((user: Examinee) => {
                const { lmsUserId, code, name } = user;
                const docRef = doc(db, 'exams', examId, 'users', lmsUserId);
                batch.set(docRef, {
                    roomId,
                    code,
                    name,
                }, { merge: true });
            });
            await batch.commit();
        }
    },
    getListenScreenshotsByUserId(examId, userId, callback) {
        const screenshotCollectioRef = collection(db, 'screenshots');
        const filterByExam = where('examId', '==', Number(examId));
        const filterByUser = where('userId', '==', Number(userId));
        const filterByAIFinalDecision = where('multiClassificationResult.final_decision', "in", ["Suspicious", "Dishonest"])
        const orderByCreatedAt = orderBy('createdAt', 'desc');
        const q = query(screenshotCollectioRef, filterByUser, filterByExam, filterByAIFinalDecision, orderByCreatedAt);

        return onSnapshot(q, (querySnapshot) => {
            callback(querySnapshot);
        })


    },
    async setProctorClassificationResult(examId, screenshotId, result) {
        const screenshotRef = doc(db, 'screenshots', screenshotId);
        await setDoc(screenshotRef, {
            proctorClassificationResult: result
        }, { merge: true });

        try {
            const verificationRef = doc(db, 'exams', examId, 'verifications', screenshotId);
            await deleteDoc(verificationRef);
        } catch (e) {
            console.log("verification not exist");
        }

    },
    getListenVerificationByRoomId(examId, roomId, callback) {
        const verificationCollectionRef = collection(db, 'exams', examId, 'verifications');
        const filterByRoomId = where('roomId', '==', roomId);
        const orderByCreatedAt = orderBy('createdAt', 'desc');
        const q = query(verificationCollectionRef, filterByRoomId, orderByCreatedAt);

        return onSnapshot(q, (querySnapshot) => {
            callback(querySnapshot);
        })
    },
    async sendWarningMessage(examId, userId, message, createdBy) {
        const warningMessageRef = collection(db, 'exams', examId, 'users', userId, 'warningMessages');
        await addDoc(warningMessageRef, {
            message,
            createdAt: serverTimestamp(),
            createdBy
        })
    },
    async updateExamineeStats(examId, userId, stats) {
        const userRef = doc(db, 'exams', examId, 'users', userId);
        await setDoc(userRef, {
            ...stats
        }, { merge: true });
    },
}