import { collection, doc, onSnapshot, orderBy, query, setDoc, where, writeBatch } from "firebase/firestore";
import type { AppDataService, Examinee, Screenshot } from "./data.types";
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
    getListenScreenshotsByUserId(examId, userId, callback) {
        const screenshotCollectioRef = collection(db,'screenshots');
        const filterByExam = where('examId','==',Number(examId));
        const filterByUser = where('userId','==',Number(userId));
        const filterByAIFinalDecision = where('multiClassificationResult.final_decision',"in",["Suspicious","Dishonest"])
        const orderByCreatedAt = orderBy('createdAt','desc');
        const q = query(screenshotCollectioRef,filterByUser,filterByExam, filterByAIFinalDecision,orderByCreatedAt);
       
        return onSnapshot(q,(querySnapshot)=>{
            callback(querySnapshot);
        })


    },
    async setProctorClassificationResult(screenshotId,result){
        const screenshotRef = doc(db,'screenshots',screenshotId);
        await setDoc(screenshotRef,{
           proctorClassificationResult:result
        },{merge:true});    
    }
}