import { Routes } from '@angular/router';
import { LandingPage } from './pages/landing-page/landing-page';
import {Login} from './pages/login/login';
import { FreelancerLogin } from './pages/freelancer-login/freelancer-login';
import { FreelancerRegister } from './pages/freelancer-register/freelancer-register';
import { Dashboard } from './pages/dashboard/dashboard';
import { DashboardShell } from './pages/dashboard-shell/dashboard-shell';

export const routes: Routes = [
  {
    path: '',
    component: LandingPage,
    pathMatch:'full',
  },
   {
    path: 'login',
    component: Login,
  },
  {
    path:'freelancerlogin',
    component:FreelancerLogin
  },
  { 
    path: 'freelancer-register', 
    component: FreelancerRegister 
  },
   {
    path: '',
    component: DashboardShell,
    children: [
      { path: 'dashboard', component: Dashboard },
    ],
  },
];