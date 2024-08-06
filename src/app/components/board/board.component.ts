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
    ToastModule
  ],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss',
  providers: [ConfirmationService, MessageService]
})
export class BoardComponent {
  isLoading: boolean = false;
  prefix: string = 'TaskNo' // Prefix for ticket IDs.
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
  currentDueDate: Date = new Date();
  authors: Author[] = [];
  createMode: boolean = false;
  editMode: boolean = false;
  currentUser: any;

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
      this.loadCurrentUser();
      
    } catch (e) {
      this.error = 'Fehler beim Laden';
    }
  }

  openDeleteDialog(event: Event, taskId: number) {
    let ticketNumber = this.formatTicketId(taskId)
    this.confirmationService.confirm({
        target: event.target as EventTarget,
        message: `Do you want to delete the task "${ticketNumber}"?`,
        header: 'Delete Confirmation',
        icon: 'pi pi-trash',
        acceptButtonStyleClass:"p-button-danger p-button-text",
        rejectButtonStyleClass:"p-button-text p-button-text",
        acceptIcon:"none",
        rejectIcon:"none",

        accept: () => {
          console.log('Accepted')
            this.deleteTask(taskId)
            this.messageService.add({ severity: 'success', summary: 'Confirmed', detail: `${ticketNumber} has been deleted` });
        }
    });
  }

  loadTasks() {
    this.isLoading = true;
    this.taskService.loadTasks().subscribe((tasks: Task[]) => {
      this.tasks = tasks;
      this.state1Tasks = tasks.filter((task) => task.state === 'To Do');
      this.state2Tasks = tasks.filter((task) => task.state === 'In Progress');
      this.state3Tasks = tasks.filter(
        (task) => task.state === 'Awaiting Feedback'
      );
      this.state4Tasks = tasks.filter((task) => task.state === 'Done');
      console.log(tasks);
      this.isLoading = false;
    });
  }

  loadUsers() {
    this.isLoading = true;
    this.taskService.loadUsers().subscribe((users) => {
      this.authors = users;
      console.log(this.authors);
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

  editTask(taskId: number) {
    this.isLoading = true;
    this.taskViewVisible = true;
    this.createMode = false;
    this.editMode = true;
    this.taskService.loadTask(taskId).subscribe((task: Task[]) => {
      this.singleTaskData = task[0];
      this.selectedPriority = this.singleTaskData.priority;
      this.selectedAuthor = this.authors.find(
        (author: Author) => author.id === this.singleTaskData.author
      );
      this.currentDueDate = new Date(this.singleTaskData.due_date);
      this.isLoading = false;
    });
  }

  createTask() {
    this.isLoading = true;
    this.taskViewVisible = true;
    this.singleTaskData = {};   
    this.createMode = true;
    this.editMode = false;
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
    let taskId = this.singleTaskData.id;
    let title = this.singleTaskData.title;
    let description = this.singleTaskData.description;
    let due_date = this.getFormattedDateStringForDB(this.currentDueDate);
    let priority = this.singleTaskData.priority;
    let author = this.selectedAuthor.id;

    if (this.editMode) {
      this.taskService
        .updateTask(taskId, title, description, priority, due_date, author)
        .subscribe(
          () => {
            this.loadTasks();
            this.resetEdit();
            let ticketNumber = this.formatTicketId(taskId)
            this.messageService.add({ severity: 'success', summary: 'Confirmed', detail: `${ticketNumber} has been updated` });
          },
          (error) => {
            console.error('Error updating task check state:', error);
          }
        );
    }
    if (this.createMode) {
      this.taskService
        .addNewTask(title, description, priority, due_date, author)
        .subscribe(
          () => {
            this.loadTasks();
            this.resetEdit();
            this.messageService.add({ severity: 'success', summary: 'Confirmed', detail: `Task has been created` });
          },
          (error) => {
            console.error('Error updating task check state:', error);
          }
        );
    }
    if (
      (this.createMode && this.editMode) ||
      (!this.createMode && !this.editMode)
    ) {
      console.log(
        'Error',
        'this.createMode',
        this.createMode,
        'this.editMode',
        this.editMode
      );
    }
  }

  updateTaskState(taskId: number, state: string) {
    this.isLoading = true;
    this.taskService.updateTaskState(taskId, state).subscribe(
      () => {
        this.loadTasks();
        this.resetEdit();
      },
      (error) => {
        console.error('Error updating task check state:', error);
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

  resetEdit() {
    this.editMode = false;
    this.createMode = false;
    this.singleTaskData = {};
    this.selectedAuthor = {};
    this.taskViewVisible = false;
    this.currentTaskDragged = undefined;
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

  public isFormValid() {
    if (
      this.singleTaskData.title === undefined &&
      this.singleTaskData.description === undefined
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
    if (inputPriority === priority) return true
    else return false;
  }
  }
