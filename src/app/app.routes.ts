import { Routes } from '@angular/router';
import { LandingPage } from './pages/landing-page/landing-page';
import {Login} from './pages/login/login';

export const routes: Routes = [
  {
    path: '',
    component: LandingPage,
  },
   {
    path: 'login',
    component: Login,
  }
];