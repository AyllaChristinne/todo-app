import { Injectable } from '@angular/core';

const LOCAL_STORAGE_KEY = 'todo/theme';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private currentTheme: 'light' | 'dark' = 'light';

  constructor() {
    const savedThemeLocal = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedThemeLocal === 'light' || savedThemeLocal === 'dark') {
      this.currentTheme = savedThemeLocal;
    }
  }

  getCurrentTheme() {
    return this.currentTheme;
  }

  setTheme(theme: 'light' | 'dark') {
    this.currentTheme = theme;
    localStorage.setItem(LOCAL_STORAGE_KEY, theme);
  }

  setThemeFromLocalStorage() {}
}
