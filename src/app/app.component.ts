import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  Renderer2,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { ITodoItem } from './todo-model';
import { TodoItemsService } from './services/todo-service.service';
import { TodoItemComponent } from './todo-item/todo-item.component';
import { Subscription } from 'rxjs';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    TodoItemComponent,
    DragDropModule,
    FormsModule,
    CommonModule,
  ],
  providers: [TodoItemsService, ThemeService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  currTheme: 'light' | 'dark';
  currFilter = 'none';
  currItems: ITodoItem[] = [];
  itemsLeft: number = 0;
  newTaskText = '';
  snackbar: HTMLElement | null;

  private allItemsSubscription: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private todoService: TodoItemsService,
    private themeService: ThemeService,
    private elRef: ElementRef,
    private renderer: Renderer2
  ) {
    this.currTheme = themeService.getCurrentTheme();
    this.snackbar = null;
  }

  ngOnInit(): void {
    this.todoService.initializeLocalStorage();

    this.route.queryParams.subscribe((params) => {
      if (params['filter']) {
        this.currFilter = params['filter'];
      } else {
        this.currFilter = 'none';
      }

      this.getFilteredTasks();
    });
    this.calcItemsLeft();

    this.allItemsSubscription = this.todoService.allItems$.subscribe(
      (items) => {
        this.getFilteredTasks();
        this.calcItemsLeft();
        this.currItems = items;
      }
    );
  }

  ngAfterViewInit() {
    this.snackbar = this.elRef.nativeElement.querySelector('#snackbar');
  }

  ngOnDestroy(): void {
    if (this.allItemsSubscription) {
      this.allItemsSubscription.unsubscribe();
    }
  }

  addItem() {
    if (this.newTaskText.trim().length > 3) {
      this.todoService.addItem(this.newTaskText);
      this.newTaskText = '';
    } else {
      this.showSnackbar();
    }
  }

  removeCompleted() {
    this.todoService.removeCompleteItems();
  }

  handleCheckboxClick(id: string) {
    const item = this.currItems.find((item) => item.id === id);
    if (item && item.status === 'active') {
      this.todoService.changeItemStatus(id, 'completed');
    } else {
      this.todoService.changeItemStatus(id, 'active');
    }
    this.getFilteredTasks();
  }

  onFilterClick(filter: string): void {
    this.currFilter = filter;

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { filter: filter },
      queryParamsHandling: 'merge',
    });
  }

  getFilteredTasks() {
    switch (this.currFilter) {
      default:
      case 'none':
        this.currItems = this.todoService.getAllTasks();
        break;
      case 'active':
        this.currItems = this.todoService.getFilteredTasks('active');
        break;
      case 'completed':
        this.currItems = this.todoService.getFilteredTasks('completed');
        break;
    }
  }

  calcItemsLeft() {
    this.itemsLeft = this.todoService.getFilteredTasks('active').length;
  }

  toggleTheme(): void {
    this.currTheme = this.currTheme === 'light' ? 'dark' : 'light';
    this.themeService.setTheme(this.currTheme);
  }

  onDrop(event: CdkDragDrop<string[]>): void {
    moveItemInArray(this.currItems, event.previousIndex, event.currentIndex);
  }

  showSnackbar() {
    if (this.snackbar) {
      this.renderer.addClass(this.snackbar, 'show');
      setTimeout(() => {
        this.renderer.removeClass(this.snackbar, 'show');
      }, 3000);
    }
  }
}
