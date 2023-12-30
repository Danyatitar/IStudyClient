import { TeacherOrStudentInterface } from './teacher.interface';
import { WorkInterface } from './work.interface';

export interface TaskInterface {
  _id: string;
  name: string;
  maxMark: number;
  courseId: string;
  deadline: Date;
  description: string;
  allowPublication: boolean;
  fileId: File;
  deadlineDisplay?: string;
  work?: WorkInterface;
}

export interface File {
  filename: string;
  _id: string;
}

export interface TaskStandingsInterface {
  students: TeacherOrStudentInterface[];
  data: [
    {
      maxMark: number;
      task: string;
      taskId: string;
      works: [
        {
          studentId: string;
          task: string;
          mark: number;
          avgMark: number;
          studentName: string;
        }
      ];
    }
  ];
}
