import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LogoutService } from '../../services/logout.service';
import { DataService } from '../../services/data.service';
import { DragDropModule } from 'primeng/dragdrop';
import { PanelModule } from 'primeng/panel';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, FormsModule, DragDropModule, PanelModule, CardModule, ButtonModule],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent {
  isLoading: boolean = false;
  tasks: any = [];
  singleTask: any = {};
  error: string = '';
  taskTitle: string = '';
  taskDescription: string = '';
  edit: boolean = false;

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

  loadTasks() {
    this.isLoading = true;
    this.taskService.loadTasks().subscribe((tasks) => {
      this.tasks = tasks;
      console.log(tasks);
      
      this.isLoading = false;
    });
  }

  editTask(taskId: number) {
    if (!this.edit) {
      this.isLoading = true;
      this.edit = true;
      
      this.taskService.loadTask(taskId).subscribe(
        (task) => {
          this.singleTask = task[0];
          this.isLoading = false;
        }
      );
    } else {
      this.resetEdit()
    }
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

  updateTaskChecked(taskId: number, checked: boolean): void {
    this.taskService.updateTaskChecked(taskId, checked).subscribe(
      () => {
        // console.log(`Task with ID ${taskId} check state updated to ${checked} successfully`);
        this.loadTasks();
      },
      (error) => {
        console.error('Error updating task check state:', error);
      }
    );
  }

  saveTask() {
    this.isLoading = true;
    let taskId = this.singleTask.id;
    let title = this.singleTask.title;
    let description = this.singleTask.description;
    this.taskService.updateTaskTitle(taskId, title, description).subscribe(
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

  resetEdit() {
    this.edit = false;
    this.singleTask = {}
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


  dragStart() {
    console.log("Started dragging");
  }

  drop() {
    console.log("Dropped dragged item");
  }

  dragEnd() {
    console.log("Ended dragging");
  }
}
