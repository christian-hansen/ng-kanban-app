import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LogoutService } from '../../services/logout.service';
import { DataService } from '../../services/data.service';
import { DragDropModule } from 'primeng/dragdrop';
import { PanelModule } from 'primeng/panel';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SidebarModule } from 'primeng/sidebar';
import { InplaceModule } from 'primeng/inplace';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TooltipModule } from 'primeng/tooltip';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TableModule } from 'primeng/table';
import { CheckboxModule } from 'primeng/checkbox';
import { Task } from '../../models/task.model';
import { Author } from '../../models/author.model';
import { UserService } from '../../services/user.service';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    PanelModule,
    CardModule,
    ButtonModule,
    SidebarModule,
    InplaceModule,
    InputTextModule,
    InputTextareaModule,
    DropdownModule,
    CalendarModule,
    RadioButtonModule,
    TooltipModule,
    AvatarModule,
    DividerModule,
    TagModule,
    ConfirmDialogModule,
    ToastModule,
    TableModule,
    CheckboxModule,
  ],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss',
  providers: [ConfirmationService, MessageService],
})
export class BoardComponent {
  isLoading: boolean = false;
  prefix: string = 'TaskNo'; // Prefix for ticket IDs.
  tasks: Task[] = [];
  state1Tasks: Task[] = [];
  state2Tasks: Task[] = [];
  state3Tasks: Task[] = [];
  state4Tasks: Task[] = [];
  singleTaskData: any = {};
  error: string = '';
  taskTitle: string = '';
  taskDescription: string = '';
  edit: boolean = false;
  currentTaskDragged: number | undefined;
  currentTaskDraggedState: string = '';
  taskViewVisible: boolean = false;
  taskViewSelectedTask: any = {};
  priorities: string[] = ['High', 'Medium', 'Low'];
  selectedPriority: string | undefined;
  selectedAuthor: any;
  selectedContact: any;
  currentDueDate: Date = new Date();
  authors: Author[] = [];
  createMode: boolean = false;
  editMode: boolean = false;
  contactsViewVisible: boolean = false;
  editContactMode: boolean = false;
  createContactMode: boolean = false;
  contacts: any;
  singleContactData: any = {};
  currentUser: any;
  private contactCache: { [id: number]: any } = {};

  constructor(
    private logoutService: LogoutService,
    private taskService: DataService,
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    try {
      this.loadTasks();
      this.loadUsers();
      this.loadContacts();
      this.loadCurrentUser();
    } catch (e) {
      this.error = 'Fehler beim Laden';
    }
  }

  // Loading functions

  loadTasks() {
    this.isLoading = true;
    this.taskService.loadTasks().subscribe((tasks: Task[]) => {
      this.tasks = tasks;
      console.log(tasks);

      this.state1Tasks = tasks.filter((task) => task.state === 'To Do');
      this.state2Tasks = tasks.filter((task) => task.state === 'In Progress');
      this.state3Tasks = tasks.filter(
        (task) => task.state === 'Awaiting Feedback'
      );
      this.state4Tasks = tasks.filter((task) => task.state === 'Done');
      // console.log(tasks);
      this.isLoading = false;
    });
  }

  loadUsers() {
    this.isLoading = true;
    this.taskService.loadUsers().subscribe((users) => {
      this.authors = users;
      // console.log(this.authors);
      this.isLoading = false;
    });
  }

  loadCurrentUser() {
    this.isLoading = true;
    this.userService.getCurrentUser().subscribe((user) => {
      this.currentUser = user;
      this.isLoading = false;
    });
  }

  // Task updating functions

  generateTaskData() {
    return {
      taskId: this.singleTaskData.id,
      title: this.singleTaskData.title,
      description: this.singleTaskData.description,
      due_date: this.getFormattedDateStringForDB(this.currentDueDate),
      priority: this.singleTaskData.priority,
      contact: this.selectedContact.id,
      author: this.selectedAuthor.id,
    };
  }

  editTask(taskId: number) {
    this.isTaskViewEditMode(true);
    this.taskService.loadTask(taskId).subscribe((task: Task[]) => {
      this.singleTaskData = task[0];
      this.loadTaskFormPreSelections();
      if (this.singleTaskData.subtask_ids.length > 0) {
        this.loadTasksSubTasks(taskId);
      }
      this.isLoading = false;
    });
  }

  loadTaskFormPreSelections() {
    this.selectedPriority = this.singleTaskData.priority;
    this.selectedContact = this.contacts.find(
      (contact: any) => contact.id === this.singleTaskData.contact
    );
    this.selectedAuthor = this.authors.find(
      (author: Author) => author.id === this.singleTaskData.author
    );
    this.currentDueDate = new Date(this.singleTaskData.due_date);
  }

  loadTasksSubTasks(taskId: number) {
    this.taskService.loadTasksSubTasks(taskId).subscribe((subtasks: any) => {
      this.singleTaskData.subtasks = subtasks;
      console.log('subtasks', this.singleTaskData.subtasks);
    });
  }

  createTask() {
    this.isTaskViewEditMode(false);
    this.singleTaskData = {};
    this.singleTaskData.priority = 'Low';
    this.selectedAuthor = this.authors.find(
      (author: Author) => author.id === this.currentUser.id
    );
    this.isLoading = false;
  }

  deleteTask(taskId: number): void {
    this.taskService.deleteTaskById(taskId).subscribe(
      () => {
        this.loadTasks();
      },
      (error) => {
        console.error('Error deleting task:', error);
      }
    );
  }

  saveTask() {
    this.isLoading = true;
    console.log('this.selectedContact', this.selectedContact);
    let taskData = this.generateTaskData();

    if (this.editMode) {
      this.updateTaskInDb(taskData);
    } else if (this.createMode) {
      this.createTaskInDb(taskData);
    } else {
      this.logModeError();
    }
  }

  updateTaskInDb(taskData: any) {
    this.taskService.updateTask(taskData).subscribe(
      () => {
        this.loadTasks();
        this.resetEdit();
        let ticketNumber = this.formatTicketId(taskData.taskId);
        this.displayTaskUpdatedMessage(ticketNumber, 'updated');
      },
      (error) => {
        console.error('Error updating task:', error);
      }
    );
  }

  createTaskInDb(taskData: any) {
    this.taskService.addNewTask(taskData).subscribe(
      () => {
        this.loadTasks();
        this.resetEdit();
        this.displayTaskCreatedMessage();
      },
      (error) => {
        console.error('Error updating task:', error);
      }
    );
  }

  // Board dragging actions

  updateTaskState(taskId: number, state: string) {
    this.isLoading = true;
    this.taskService.updateTaskState(taskId, state).subscribe(
      () => {
        this.loadTasks();
        this.resetEdit();
      },
      (error) => {
        console.error('Error updating task:', error);
      }
    );
  }

  dragStart(taskId: number, state: string) {
    this.isLoading = true;
    this.currentTaskDragged = taskId;
    this.currentTaskDraggedState = state;
  }

  drop(dropState: string) {
    let taskId = this.currentTaskDragged;
    if (taskId && !this.isDraggedTaskStateDropState(dropState)) {
      this.updateTaskState(taskId, dropState);
    }
  }

  dragEnd() {
    this.isLoading = false;
    this.resetEdit();
  }

  isDraggedTaskStateDropState(dropState: string) {
    return this.currentTaskDraggedState === dropState;
  }

  // Contact functions

  openContactsSidebar() {
    this.contactsViewVisible = true;
    this.loadContacts();
  }

  loadContacts() {
    this.isLoading = true;
    this.taskService.loadContacts().subscribe((contacts: any) => {
      this.contacts = contacts;
      this.isLoading = false;
    });
  }

  createContact() {
    this.createContactMode = true;
    this.singleContactData = {};
  }

  editContact(contact: any) {
    this.editContactMode = true;
    this.singleContactData.id = contact.id;
    this.singleContactData.first_name = contact.first_name;
    this.singleContactData.last_name = contact.last_name;
  }

  deleteContact(contactId: number) {
    this.taskService.deleteContactById(contactId).subscribe(
      () => {
        this.openContactsSidebar();
      },
      (error) => {
        console.error('Error deleting contact:', error);
      }
    );
  }

  closeEditContact() {
    this.editContactMode = false;
    this.singleContactData = {};
  }

  saveContact() {
    this.isLoading = true;
    let contactData = this.generateContactData();

    if (this.editContactMode) {
      this.updateContactInDb(contactData);
    } else if (this.createContactMode) {
      this.createContactInDb(contactData);
    } else {
      this.logModeError();
    }
  }

  generateContactData() {
    return {
      contactId: this.singleContactData.id,
      first_name: this.singleContactData.first_name,
      last_name: this.singleContactData.last_name,
    };
  }

  updateContactInDb(contactData: any) {
    this.taskService.updateContact(contactData).subscribe(
      () => {
        this.resetEdit();
        this.openContactsSidebar();
      },
      (error) => {
        console.error('Error updating contact:', error);
      }
    );
  }

  createContactInDb(contactData: any) {
    this.taskService.addNewContact(contactData).subscribe(
      (contact: any) => {
        this.loadContacts();
        this.resetEdit();
        this.displayContactCreatedMessage(contact.full_name);
        this.openContactsSidebar();
      },
      (error) => {
        console.error('Error updating contact:', error);
      }
    );
  }

  public getContactFullName(contactId: number) {
    if (this.contactCache[contactId]) {
      let full_name = this.contactCache[contactId][0].full_name;
      // console.log("contact", this.contactCache[contactId][0].full_name);
      return full_name;
    } else {
      this.taskService.loadContact(contactId).subscribe((contact: any) => {
        this.contactCache[contactId] = contact; // Cache the contact
        // console.log("contact", contact.full_name);
      });
    }
  }

  // Display Messages & Dialogs

  openDeleteDialog(event: Event, taskId: number) {
    let ticketNumber = this.formatTicketId(taskId);
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Do you want to delete the task "${ticketNumber}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-trash',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-text',
      acceptIcon: 'none',
      rejectIcon: 'none',

      accept: () => {
        this.deleteTask(taskId);
        this.displayTaskUpdatedMessage(ticketNumber, 'deleted');
      },
    });
  }

  openDeleteContactDialog(event: Event, contact: any) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: `Do you want to delete your contact "${contact.full_name}"?`,
      header: 'Delete Confirmation',
      icon: 'pi pi-trash',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-text',
      acceptIcon: 'none',
      rejectIcon: 'none',

      accept: () => {
        this.deleteContact(contact.id);
        let fullName = `Contact "${contact.full_name}"`;
        this.displayTaskUpdatedMessage(fullName, 'deleted');
      },
    });
  }

  displayContactCreatedMessage(contact: string) {
    this.messageService.add({
      severity: 'success',
      summary: 'Confirmed',
      detail: `Contact "${contact}" has been created`,
    });
  }

  displayTaskCreatedMessage() {
    this.messageService.add({
      severity: 'success',
      summary: 'Confirmed',
      detail: `Task has been created`,
    });
  }

  displayTaskUpdatedMessage(ticketNumber: string, action: string) {
    this.messageService.add({
      severity: 'success',
      summary: 'Confirmed',
      detail: `${ticketNumber} has been ${action}`,
    });
  }

  // Helper functions

  isTaskViewEditMode(edit: boolean) {
    this.isLoading = true;
    this.taskViewVisible = true;

    if (edit) {
      this.createMode = false;
      this.editMode = true;
    } else {
      this.createMode = true;
      this.editMode = false;
    }
  }

  resetEdit() {
    this.editMode = false;
    this.createMode = false;
    this.singleTaskData = {};
    this.selectedAuthor = {};
    this.selectedContact = {};
    this.singleContactData = {};
    this.taskViewVisible = false;
    this.contactsViewVisible = false;
    this.editContactMode = false;
    this.createContactMode = false;
    this.currentTaskDragged = undefined;
  }

  public isFormValid() {
    if (
      this.singleTaskData.title === undefined &&
      this.singleTaskData.description === undefined
    ) {
      return true;
    } else return false;
  }

  public isContactFormValid() {
    if (
      this.singleContactData.first_name === undefined ||
      this.singleContactData.last_name === undefined
    ) {
      return true;
    } else return false;
  }

  getFormattedDateStringForDB(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-indexed
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getAuthorFullNameById(id: number) {
    const author = this.authors.find((author: Author) => author.id === id);
    if (author) {
      return `${author.first_name} ${author.last_name}`;
    } else {
      return 'Author not found';
    }
  }

  getAuthorInitialsById(id: number) {
    const author = this.authors.find((author: Author) => author.id === id);
    if (author) {
      const firstInitial = author.first_name.charAt(0).toUpperCase();
      const lastInitial = author.last_name.charAt(0).toUpperCase();
      return `${firstInitial}${lastInitial}`;
    } else {
      return 'NA'; // Return 'NA' if the author is not found
    }
  }

  formatTicketId(taskId: number): string {
    const formattedId = `${this.prefix}-${taskId.toString().padStart(4, '0')}`;
    return formattedId;
  }

  getTagSeverity(inputPriority: string, priority: string): boolean {
    if (inputPriority === priority) return true;
    else return false;
  }

  logModeError() {
    console.log(
      'Error',
      'this.createMode',
      this.createMode,
      'this.editMode',
      this.editMode
    );
  }

  logout() {
    this.isLoading = true;
    this.logoutService.logout().subscribe(
      () => {
        window.location.href = '/login';
      },
      (error) => {
        console.error('Logout error', error);
      }
    );
  }
}
