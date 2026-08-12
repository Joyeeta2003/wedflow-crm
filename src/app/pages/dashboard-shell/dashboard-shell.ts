import { Component,viewChild } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Sidebar } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-dashboard-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Sidebar],
  templateUrl: './dashboard-shell.html',
  styleUrl: './dashboard-shell.scss',
})
export class DashboardShell {
  sidebar = viewChild(Sidebar);

  toggleMobileSidebar() {
    const sidebar = this.sidebar();

    if (sidebar) {
      sidebar.isMobileOpen = !sidebar.isMobileOpen;
    }
  }
}