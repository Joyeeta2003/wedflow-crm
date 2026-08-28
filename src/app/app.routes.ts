import { Routes } from '@angular/router';
import { LandingPage } from './pages/landing-page/landing-page';
import { Login } from './pages/login/login';
import { FreelancerLogin } from './pages/freelancer-login/freelancer-login';
import { FreelancerRegister } from './pages/freelancer-register/freelancer-register';
import { Dashboard } from './pages/dashboard/dashboard';
import { DashboardShell } from './pages/dashboard-shell/dashboard-shell';
import { Packages } from './pages/packages/packages';
import { Clients } from './pages/clients/clients';
import {UserManagement} from './pages/user-management/user-management'

export const routes: Routes = [
  {
    path: '',
    component: LandingPage,
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'freelancerlogin',
    component: FreelancerLogin,
  },
  {
    path: 'freelancer-register',
    component: FreelancerRegister,
  },
  {
    path: '',
    component: DashboardShell,
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'packages', component: Packages }, // <-- EKHANE niye asha holo
      { path: 'clients', component: Clients }, // <-- EKHANE niye asha holo
      { path: 'users', component: UserManagement },
    ],
  },
];