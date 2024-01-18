import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ITodoItem } from '../todo-model';
import { TodoItemsService } from '../services/todo-service.service';

@Component({
  selector: 'app-todo-item',
  standalone: true,
  imports: [],
  templateUrl: './todo-item.component.html',
  styleUrl: './todo-item.component.scss',
})
export class TodoItemComponent {
  @Input()
  item!: ITodoItem;
  @Output() checkboxClick = new EventEmitter<string>();

  constructor(private todoService: TodoItemsService) {}

  ngOnInit() {}

  onCheckboxClick(id: string): void {
    this.checkboxClick.emit(id);
  }

  deleteItem(id: string) {
    this.todoService.deleteItem(id);
  }
}
