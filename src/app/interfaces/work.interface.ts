import { TeacherOrStudentInterface } from './teacher.interface';
import { File, TaskInterface } from './task.interface';
export interface WorkInterface {
  description: string;
  publicate: boolean;
  status: string;
  taskId: string;
  studentId: TeacherOrStudentInterface;
  fileId: File;
  _id: string;
  mark?: number;
}

export interface PublicationInterface {
  comments: Comment[];
  marks: Mark[];
  avgMark: number;
  description: string;
  publicate: boolean;
  status: string;
  taskId: TaskInterface;
  studentId: TeacherOrStudentInterface;
  fileId: File;
  _id: string;
  mark?: number;
  show?: boolean;
  content?: string;
}

interface Comment {
  my?: boolean;
  _id: string;
  text: string;
  studentId: TeacherOrStudentInterface;
}

export interface Mark {
  _id: string;
  mark: number;
  studentId: TeacherOrStudentInterface;
}
