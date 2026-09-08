import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {

  isMobileOpen = signal(false);

  open() {
    this.isMobileOpen.set(true);
  }

  close() {
    this.isMobileOpen.set(false);
  }

  toggle() {
    this.isMobileOpen.update(value => !value);
  }
}
