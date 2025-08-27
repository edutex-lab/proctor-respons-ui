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

export interface LMSDataService {
    getExaminees(examId: string, roomId: string): Promise<Examinee[]>;
    getExamInfo(examId: string): Promise<ExamInfo>;

}


export interface AppDataService{
    setRoomForUsers(examId: string, roomId: string, users: Examinee[]): Promise<void>;
}