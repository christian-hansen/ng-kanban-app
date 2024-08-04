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
import { Task } from '../../models/task.model';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, PanelModule, CardModule, ButtonModule, SidebarModule, InplaceModule, InputTextModule, InputTextareaModule, DropdownModule, CalendarModule],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent {
  isLoading: boolean = false;
  tasks: Task[] = [];
  state1Tasks: Task[] = [];
  state2Tasks: Task[] = [];
  state3Tasks: Task[] = [];
  singleTaskData: any = {};
  error: string = '';
  taskTitle: string = '';
  taskDescription: string = '';
  edit: boolean = false;
  currentTaskDragged: number | undefined;
  currentTaskDraggedState: string = '';
  taskViewVisible: boolean = false;
  taskViewSelectedTask: any = {};
  priorities: string[] = ["High", "Medium", "Low"]
  selectedPriority: string | undefined;
  currentDueDate: Date = new Date();
  assignees: any = ["1", "2", "3"];

  constructor(
    private logoutService: LogoutService,
    private taskService: DataService,
  ) {}

  ngOnInit(): void {
    try {
      this.loadTasks();
    } catch (e) {
      this.error = 'Fehler beim Laden';
    }
  }

  logSelectedPriority() {
    console.log(this.selectedPriority);
    
  }

  loadTasks() {
    this.isLoading = true;
    this.taskService.loadTasks().subscribe((tasks:Task[]) => {
      this.tasks = tasks;
      this.state1Tasks = tasks.filter(task => task.state === 'state1');
      this.state2Tasks = tasks.filter(task => task.state === 'state2');
      this.state3Tasks = tasks.filter(task => task.state === 'state3');
      console.log(tasks);
      this.isLoading = false;
    });
  }

  editTask(taskId: number) {
    this.taskViewVisible = true;
    this.isLoading = true;
    this.taskService.loadTask(taskId).subscribe(
            (task: Task[]) => {
              this.singleTaskData = task[0];
              console.log("this.singleTaskData", this.singleTaskData);
              this.selectedPriority = this.singleTaskData.priority;
              this.currentDueDate = new Date(this.singleTaskData.due_date);
              // this.currentDueDate = this.singleTaskData.due_date;
              // console.log(this.dueDate);
              
              this.isLoading = false;
            }
          );
  }

  addNewTask() {
    if (!this.taskTitle || !this.taskDescription) return;

    this.isLoading = true;
    this.taskService.addNewTask(this.taskTitle, this.taskDescription).subscribe(() => {
      this.taskTitle = '';
      this.taskDescription = '';
      this.loadTasks();
    });
  }

  deleteTask(taskId: number): void {
    this.taskService.deleteTaskById(taskId).subscribe(
      () => {
        console.log(`Task with ID ${taskId} deleted successfully`);
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
    let due_date = this.getFormattedDateStringForDB(this.currentDueDate)
    let priority = this.singleTaskData.priority;   
    this.taskService.updateTask(taskId, title, description, priority, due_date).subscribe(
      () => {
        // console.log(`Task with ID ${taskId} title changed to "${title}" successfully`);
        this.loadTasks();
        this.resetEdit()
      },
      (error) => {
        console.error('Error updating task check state:', error);
      }
    );
  }

  updateTaskState(taskId: number, state: string) {
    this.isLoading = true;
    this.taskService.updateTaskState(taskId, state).subscribe(
      () => {
        console.log(`Task with ID ${taskId} state changed to "${state}" successfully`);
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
    console.log("this.currentTaskDragged", this.currentTaskDragged, "this.currentTaskDraggedState", this.currentTaskDraggedState);
    
    console.log("Started dragging", taskId);
  }

  drop(dropState: string) {
    let taskId = this.currentTaskDragged;
    console.log('taskId dropped', taskId);
    if (taskId && !this.isDraggedTaskStateDropState(dropState)) {
      console.log("Dropped dragged item", taskId, dropState);
      this.updateTaskState(taskId, dropState)
    }
  }

  dragEnd() {
    this.isLoading = false;
    console.log("Ended dragging", this.currentTaskDragged);
    this.resetEdit()
  }

  isDraggedTaskStateDropState(dropState: string) {
    return this.currentTaskDraggedState === dropState;
  }


  resetEdit() {
    this.edit = false;
    this.singleTaskData = {}
    this.taskViewVisible = false;
    this.currentTaskDragged = undefined;
  }
  

  logout() {
    this.isLoading = true;
    this.logoutService.logout().subscribe(
      () => {
        // console.log('Logout successful');
        window.location.href = '/login';
      },
      (error) => {
        console.error('Logout error', error);
      }
    );
  }

  getFormattedDateStringForDB(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-indexed
    const day = date.getDate().toString().padStart(2, '0');
  
    // Format the date as "YYYY-MM-DD"
    return `${year}-${month}-${day}`;
  }
  

  // updateTaskChecked(taskId: number, checked: boolean): void {
  //   this.taskService.updateTaskChecked(taskId, checked).subscribe(
  //     () => {
  //       // console.log(`Task with ID ${taskId} check state updated to ${checked} successfully`);
  //       this.loadTasks();
  //     },
  //     (error) => {
  //       console.error('Error updating task check state:', error);
  //     }
  //   );
  // }

}
