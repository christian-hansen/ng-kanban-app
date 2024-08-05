import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private tasksUrl = environment.baseUrl + '/tasks/'; // API base URL
  private usersUrl = environment.baseUrl + '/users/'; // API base URL
  private authToken = 'Token ' + localStorage.getItem('token');

  constructor(private http: HttpClient) {}

  private setHeaders() {
    return new HttpHeaders().set('Authorization', this.authToken);
  }

  private handleError(error: any) {
    console.error('Error:', error);
    return throwError(error);
  }

  //Load all tasks
  loadTasks(): Observable<any> {
    return this.http
      .get<any>(this.tasksUrl, { headers: this.setHeaders() })
      .pipe(catchError(this.handleError));
  }

  loadUsers(): Observable<any> {
    return this.http
      .get<any>(this.usersUrl, { headers: this.setHeaders() })
      .pipe(catchError(this.handleError)); 
  }

  //Add a task item
  addNewTask(title: string, description: string, priority: string, due_date: string, author: number): Observable<void> {
    let date = this.getFormattedDate();
    let data = {
      title: title,
      description: description,
      priority: priority,
      created_at: due_date,
      author: author
    };

    return this.http
      .post<void>(this.tasksUrl, data, { headers: this.setHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Delete a task item by its ID
  deleteTaskById(taskId: number): Observable<void> {
    const taskUrl = `${this.tasksUrl}${taskId}/`;
    return this.http.delete<void>(taskUrl).pipe(catchError(this.handleError));
  }

  loadTask(taskId:number): Observable<any> {
    return this.http
      .get<any>(`${this.tasksUrl}${taskId}/`, { headers: this.setHeaders() })
      .pipe(catchError(this.handleError));
  }

 

  // Update the checked state of a task item by its ID
  updateTaskChecked(taskId: number, checked: boolean): Observable<void> {
    const url = `${this.tasksUrl}${taskId}/`;
    const body = { isDone: checked };

    return this.http.patch<void>(url, body).pipe(catchError(this.handleError));
  }

  // Update the title and description of a task item by its ID
  updateTask(taskId: number, title: string, description: string, priority: string, due_date: string, author: number): Observable<void> {
    const url = `${this.tasksUrl}${taskId}/`;
    const body = { title: title, description: description, priority: priority, due_date: due_date, author: author };

    return this.http.patch<void>(url, body).pipe(catchError(this.handleError));
  }

  updateTaskState(taskId: number, state: string): Observable<void> {
    const url = `${this.tasksUrl}${taskId}/`;
    const body = { state: state };

    return this.http.patch<void>(url, body).pipe(catchError(this.handleError));
  }

  //Format date to fit required format in Django
  getFormattedDate() {
    return new Date().toISOString().split('T')[0];
  }
}
