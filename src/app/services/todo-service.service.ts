import { Injectable } from '@angular/core';
import { ITodoItem } from '../todo-model';
import { NgForm } from '@angular/forms';
import { BehaviorSubject, Subject } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class TodoItemsService {
  private readonly localStorageKey = 'todo/tasks';
  private initialTask: Array<ITodoItem> = [
    {
      id: uuidv4(),
      text: 'Be awesome',
      status: 'completed',
    },
  ];

  private allItemsSubject = new BehaviorSubject<Array<ITodoItem>>(
    this.loadFromLocalStorage()
  );
  allItems$ = this.allItemsSubject.asObservable();

  constructor() {}

  getAllTasks(): ITodoItem[] {
    return this.allItemsSubject.value;
  }

  getFilteredTasks(filter: string) {
    return this.getAllTasks().filter((item) => item.status === filter);
  }

  addItem(text: string) {
    const newItem: ITodoItem = {
      id: uuidv4(),
      text: text,
      status: 'active',
    };
    const items = this.getAllTasks();

    this.updateAllItems([newItem, ...items]);
  }

  //subject.getValue()

  deleteItem(id: string) {
    const items = this.getAllTasks().filter((item) => item.id !== id);
    this.updateAllItems([...items]);
  }

  removeCompleteItems() {
    const items = this.getAllTasks().filter(
      (item) => item.status !== 'completed'
    );
    this.updateAllItems([...items]);
  }

  changeItemStatus(
    id: string,
    newStatus: 'active' | 'completed' = 'completed'
  ) {
    let items = this.getAllTasks();

    items = items.map((item) => {
      if (item.id === id) {
        return { ...item, status: newStatus };
      }
      return item;
    });

    this.updateAllItems(items);
  }

  private saveToLocalStorage(tasks: Array<ITodoItem>) {
    localStorage.setItem(this.localStorageKey, JSON.stringify(tasks));
  }

  private loadFromLocalStorage(): Array<ITodoItem> {
    const storedTasks = localStorage.getItem(this.localStorageKey);
    return storedTasks ? JSON.parse(storedTasks) : [];
  }

  private updateAllItems(newTasks: Array<ITodoItem>) {
    this.allItemsSubject.next(newTasks);
    this.saveToLocalStorage(newTasks);
  }

  initializeLocalStorage() {
    const storedData = this.loadFromLocalStorage();
    if (storedData.length === 0) {
      const initialData: Array<ITodoItem> = this.initialTask;
      this.updateAllItems(initialData);
    }
  }
}
