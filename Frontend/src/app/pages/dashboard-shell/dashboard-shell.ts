import { Component, viewChild, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Sidebar } from '../../components/sidebar/sidebar';

@Component({
  selector: 'app-dashboard-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Sidebar],
  templateUrl: './dashboard-shell.html',
  styleUrl: './dashboard-shell.scss',
})
export class DashboardShell implements OnInit {
  sidebar = viewChild(Sidebar);

  toggleMobileSidebar() {
    const sidebar = this.sidebar();
    if (sidebar) {
      sidebar.isMobileOpen = !sidebar.isMobileOpen;
    }
  }

  isDarkMode = true;

  ngOnInit(): void {
    // page load-e default dark theme thakbe, tai 'light' class thakbe na
    document.documentElement.classList.toggle('light', !this.isDarkMode);
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.documentElement.classList.toggle('light', !this.isDarkMode);
  }
}