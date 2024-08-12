import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  private tasksUrl = environment.baseUrl + '/tasks/'; // API base URL
  private usersUrl = environment.baseUrl + '/users/'; // API base URL
  private contactsUrl = environment.baseUrl + '/contacts/'; // API base URL
  private subtasksUrl = environment.baseUrl + '/subtasks/'; // API base URL
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
  addNewTask(taskData:any): Observable<void> {
    let data = {
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      created_at: taskData.due_date,
      author: taskData.author,
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

  loadTask(taskId: number): Observable<any> {
    return this.http
      .get<any>(`${this.tasksUrl}${taskId}/`, { headers: this.setHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Update the title and description of a task item by its ID
  updateTask(taskData:any): Observable<void> {
    const url = `${this.tasksUrl}${taskData.taskId}/`;
    const body = {
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      due_date: taskData.due_date,
      author: taskData.author,
      contact: taskData.contact
    };

    return this.http.patch<void>(url, body).pipe(catchError(this.handleError));
  }

  updateTaskState(taskId: number, state: string): Observable<void> {
    const url = `${this.tasksUrl}${taskId}/`;
    const body = { state: state };

    return this.http.patch<void>(url, body).pipe(catchError(this.handleError));
  }

  //Load all contacts
  loadContacts(): Observable<any> {
    return this.http
      .get<any>(this.contactsUrl, { headers: this.setHeaders() })
      .pipe(catchError(this.handleError));
  }

  loadContact(contactId: number): Observable<void> {
    return this.http
      .get<any>(`${this.contactsUrl}${contactId}/`, { headers: this.setHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Delete a task item by its ID
  deleteContactById(contactId: number): Observable<void> {
    const contactUrl = `${this.contactsUrl}${contactId}/`;
    return this.http.delete<void>(contactUrl).pipe(catchError(this.handleError));
  }

  //Add a task item
  addNewContact(contactData:any): Observable<void> {
    let data = {
      first_name: contactData.first_name,
      last_name: contactData.last_name
    };

    return this.http
      .post<void>(this.contactsUrl, data, { headers: this.setHeaders() })
      .pipe(catchError(this.handleError));
  }

  // Update the title and description of a task item by its ID
  updateContact(contactData:any): Observable<void> {
    const url = `${this.contactsUrl}${contactData.contactId}/`;
    const body = {
      first_name: contactData.first_name,
      last_name: contactData.last_name
    };

    return this.http.patch<void>(url, body).pipe(catchError(this.handleError));
  }
}
