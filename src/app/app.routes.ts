import { CanActivateFn, Router, Routes } from '@angular/router';
import { inject } from '@angular/core';
import { LandingPage } from './pages/landing-page/landing-page';
import { Login } from './pages/login/login';
import { VerifyOtp } from './pages/verify-otp/verify-otp';
import { FreelancerLogin } from './pages/freelancer-login/freelancer-login';
import { FreelancerRegister } from './pages/freelancer-register/freelancer-register';
import { Dashboard } from './pages/dashboard/dashboard';
import { DashboardShell } from './pages/dashboard-shell/dashboard-shell';
import { Packages } from './pages/packages/packages';
import { Clients } from './pages/clients/clients';
import { UserManagement } from './pages/user-management/user-management';
import { Auth } from './services/auth';
import { Bookings } from './pages/bookings/bookings';
import { BookingDetail } from './pages/bookings/booking-detail/booking-detail';

const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (auth.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

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
    path: 'verify-otp',
    component: VerifyOtp,
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
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'packages', component: Packages },
      { path: 'clients', component: Clients },
      { path: 'users', component: UserManagement },
      { path: 'bookings', component: Bookings },
      { path: 'bookings/:id', component: BookingDetail },
    ],
  },
];