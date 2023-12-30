import { TaskInterface } from './task.interface';
import { TeacherOrStudentInterface } from './teacher.interface';

export interface MyCoursesInterface {
  teacherCourse: Array<MyCourseInterface>;
  studentCourse: Array<MyCourseInterface>;
}

export interface MyCourseInterface {
  _id: string;
  name: string;
  students: Array<string>;
  teacher: TeacherOrStudentInterface;
  code: string;
}
export interface CourseWithStudents {
  _id: string;
  name: string;
  students: TeacherOrStudentInterface[];
  teacher: TeacherOrStudentInterface;
  code: string;
}

export interface currentCourse {
  course: MyCourseInterface;
  isTeacher: boolean;
  tabs?: Tab[];
}
export interface Tab {
  id: string;
  label: string;
  task?: TaskInterface;
  student?: TeacherOrStudentInterface;
  component: any; // Component for teacher
  studentComponent: any; // Component for student
}
