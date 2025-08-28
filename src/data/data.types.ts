import type { QuerySnapshot, Timestamp, Unsubscribe } from "firebase/firestore";

export type Examinee = {
    id: string;
    lmsUserId: string;
    name: string;
    code: string;
}

export type ExamInfo = {
    id: string;
    name: string;
    duration: number | null;
    isDuration: number;
    startAt: string;
    endAt: string;
    courseId: string;
    courseName: string;
    courseCode: string;
    courseThumbnail: string;
    classRooms: ClassRoom[];
}

export type ClassRoom = {
    id: string;
    name: string;

}

export type MultiClassificationResult = {
  category: string;
  final_decision: string;
  description: string;
  chain_of_thought: string | null;
}

export type ProctorClassificationResult ={
    category?: string;
    final_decision: string;
}
export type Screenshot ={
    id: string;
    filePath: string;
    fileBucket: string;
    createdAt: Timestamp;
    multiClassificationResult: MultiClassificationResult | null | undefined;
    proctorClassificationResult: ProctorClassificationResult | null | undefined;
    [key: string]: any;

}

export interface LMSDataService {
    getExaminees(examId: string, roomId: string): Promise<Examinee[]>;
    getExamInfo(examId: string): Promise<ExamInfo>;

}


export interface AppDataService{
    setRoomForUsers(examId: string, roomId: string, users: Examinee[]): Promise<void>;
    getListenScreenshotsByUserId(examId: string | undefined,  userId: string | undefined, callback:(querySnapshot: QuerySnapshot | null) => void): Unsubscribe;
    // getListenScreenshotsByRoomId(examId: string, roomId: string)
    setProctorClassificationResult(screenshotId: string, result: ProctorClassificationResult): Promise<void>;

}