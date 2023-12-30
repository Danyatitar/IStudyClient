import { MatIconModule } from '@angular/material/icon';
import { CommentModal } from './comment-modal';
import { File } from './../interfaces/task.interface';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Mark, PublicationInterface } from './../interfaces/work.interface';
import { CourseService } from './../services/course.service';
import { TeacherOrStudentInterface } from './../interfaces/teacher.interface';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnDestroy } from '@angular/core';
import { TabService } from '../services/tab.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../environments/environments';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { EnterMarkModal } from './enterMark-modal';
import { MatMenuModule } from '@angular/material/menu';

export interface DialogDataEnterMark {
  id: string;
  student: TeacherOrStudentInterface;
  maxMark?: number;
  description?: string;
  fileId?: File;
  mark?: Mark;
}

export interface DialogDataCreateComment {
  workId: string;
  student?: TeacherOrStudentInterface;
  text: string;
  title: string;
  action: 'create' | 'edit';
  commentId?: string;
}

@Component({
  selector: 'app-publications',
  standalone: true,
  imports: [
    MatButtonModule,
    MatCardModule,
    CommonModule,
    MatIconModule,
    MatMenuModule,
  ],
  templateUrl: './publications.component.html',
  styleUrl: './publications.component.css',
})
export class PublicationsComponent implements OnDestroy {
  http = inject(HttpClient);
  currentUser?: TeacherOrStudentInterface;
  courseId?: string;
  tabService = inject(TabService);
  courseService = inject(CourseService);
  dialog = inject(MatDialog);
  apiUrl = environment.apiUrl;
  student?: TeacherOrStudentInterface =
    this.tabService.createTaskTab()?.student;
  publications?: PublicationInterface[];
  route = inject(ActivatedRoute);
  private routeSubscription: Subscription | undefined;

  constructor() {
    this.routeSubscription = this.route.paramMap.subscribe((params) => {
      this.courseId = String(params.get('id'));
      console.log(this.tabService.createTaskTab());
      this.http
        .get<PublicationInterface[]>(
          `${this.apiUrl}/works/publications/${this.student?._id}/?courseId=${this.courseId}`
        )
        .subscribe((response) => {
          this.publications = response.filter(
            (item) => item.status !== 'Deleted'
          );

          this.publications = this.publications.map((item) => {
            return { ...item, show: false, content: 'Show Comments' };
          });
        });

      this.http
        .get<TeacherOrStudentInterface>(`${this.apiUrl}/users`)
        .subscribe((response) => {
          this.currentUser = response;
        });
    });
  }

  ngOnDestroy(): void {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
  }
  closeTab() {
    this.tabService.closedTab.set(this.student?._id);
  }

  openComments(id: string) {
    this.publications = this.publications?.map((item) => {
      if (item._id === id) {
        if (item.show) {
          return { ...item, show: !item.show, content: 'Show Comments' };
        } else {
          const comments = item.comments.map((comment) => {
            if (comment.studentId._id === this.currentUser?._id) {
              return { ...comment, my: true };
            }
            return comment;
          });
          return {
            ...item,
            show: !item.show,
            content: 'Close Comments',
            comments: comments,
          };
        }
      }
      return item;
    });
  }

  mark(id: string) {
    const publication = this.publications?.filter((item) => item._id === id)[0];
    const mark = publication?.marks.filter(
      (item) => item.studentId._id === this.currentUser?._id
    )[0];

    const dialogRef = this.dialog.open(EnterMarkModal, {
      data: {
        fileId: publication?.fileId,
        description: publication?.description,
        maxMark: publication?.taskId.maxMark,
        id: publication?._id,
        student: publication?.studentId,
        mark: mark,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log(result);
      if (result) {
        this.publications = this.publications?.map((item) => {
          if (item._id === result._id) {
            return {
              ...result,
              show: false,
              content: 'Show Comments',
            };
          }
          return item;
        });
      }
    });
  }

  addComment(id: string) {
    const publication = this.publications?.filter((item) => item._id === id)[0];
    const dialogRef = this.dialog.open(CommentModal, {
      data: {
        title: 'Create Comment',
        text: '',
        workId: publication?._id,
        student: this.currentUser,
        action: 'create',
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.publications = this.publications?.map((item) => {
          if (item._id === result._id) {
            const comments = result.comments.map((comment: any) => {
              if (comment.studentId._id === this.currentUser?._id) {
                return { ...comment, my: true };
              }
              return comment;
            });

            return {
              ...result,
              show: true,
              content: 'Close Comments',
              comments: comments,
            };
          }
          return item;
        });
      }
    });
  }

  deleteComment(commentId: string, workId: string) {
    this.http
      .delete<PublicationInterface>(
        `${this.apiUrl}/works/comments/${workId}/?commentId=${commentId}`
      )
      .subscribe((response) => {
        this.publications = this.publications?.map((item) => {
          if (item._id === response._id) {
            const comments = response.comments.map((comment: any) => {
              if (comment.studentId._id === this.currentUser?._id) {
                return { ...comment, my: true };
              }
              return comment;
            });

            return {
              ...response,
              show: true,
              content: 'Close Comments',
              comments: comments,
            };
          }
          return item;
        });
      });
  }

  editComment(commentId: string, workId: string) {
    const publication = this.publications?.filter(
      (item) => item._id === workId
    )[0];
    const comment = publication?.comments.filter(
      (item) => item._id === commentId
    )[0];

    const dialogRef = this.dialog.open(CommentModal, {
      data: {
        title: 'Edit Comment',
        text: comment?.text,
        workId: publication?._id,
        student: this.currentUser,
        action: 'edit',
        commentId: commentId,
      },
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log(result);
        this.publications = this.publications?.map((item) => {
          if (item._id === result._id) {
            const comments = result.comments.map((comment: any) => {
              if (comment.studentId._id === this.currentUser?._id) {
                return { ...comment, my: true };
              }
              return comment;
            });

            return {
              ...result,
              show: true,
              content: 'Close Comments',
              comments: comments,
            };
          }
          return item;
        });
      }
    });
  }
}
