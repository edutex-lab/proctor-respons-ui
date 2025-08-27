import { getAppDataServices } from ".";
import { createLmsApi } from "../services";
import type { ClassRoom, LMSDataService, Examinee } from "./data.types";

const lms = "edunex";
const lmsApi = createLmsApi(lms);

export const edunexDataServices: LMSDataService = {
    async getExaminees(examId:string,roomId:string) {
    
      const req = await  lmsApi.client.get(lmsApi.endpoints.examinees,{params:{
            "filter[class_id][is]":roomId,
            "sort":"code",
            "page[limit]":"0",
            "page[offset]":"0",
        }});

    const data: Examinee[] = req.data.data.map((item:any):Examinee=>({
        id:item.id?.toString(),
        lmsUserId:item.attributes.user_id?.toString(),
        name:item.attributes.name,
        code:item.attributes.code,
        }));

        const appDataService = getAppDataServices();
        
        await appDataService.setRoomForUsers(examId,roomId,data);
       
        return data;
    
    },
    async getExamInfo(examId:string) {
       
        const req = await lmsApi.client.get(lmsApi.endpoints.exams?.replace(":examId",examId),{params:{
            "include":"course,course.classes"
        }});

        const data = req.data.data;
        const course = req.data.included.find((item:any)=>item.id?.toString()===data.attributes.course_id?.toString());
        const classes = req.data.included.filter((item:any)=>item.type==="classes").map((item:any):ClassRoom=>({
            id:item.id?.toString(),
            name:item.attributes.name,
        }));
    

            return {
                id: data.id?.toString(),
                name: data.attributes.name,
                isDuration: data.attributes.is_duration,
                duration: data.attributes.duration,
                startAt: data.attributes.start_at,
                endAt: data.attributes.end_at,
                courseId: course?.id?.toString(),
                courseName: course?.attributes.name,
                courseCode: course?.attributes.code,
                courseThumbnail: course?.attributes.thumbnail,
                classRooms:classes,
                
            }
    }
}