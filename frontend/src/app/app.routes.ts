import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page.component';
import { LoginPageComponent } from './pages/login-page.component';
import { ClientDashboardPageComponent } from './pages/client-dashboard-page.component';
import { AdminLayoutComponent } from './pages/admin-layout.component';
import { AdminDashboardPageComponent } from './pages/admin-dashboard-page.component';
import { AdminUsersComponent } from './pages/admin-users.component';
import { AdminRolesComponent } from './pages/admin-roles.component';
import { AdminRoutinesComponent } from './pages/admin-routines.component';
import { AdminScansComponent } from './pages/admin-scans.component';
import { AdminSettingsComponent } from './pages/admin-settings.component';
import { SettingsPageComponent } from './pages/settings-page.component';
import { CameraRollPageComponent } from './pages/camera-roll-page.component';
import { ReportsPageComponent } from './pages/reports-page.component';
import { PomodoroPageComponent } from './pages/pomodoro-page.component';

export const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
  },
  {
    path: 'home',
    component: ClientDashboardPageComponent,
  },
  {
    path: 'scan',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginPageComponent,
  },
  {
    path: 'settings',
    component: SettingsPageComponent,
  },
  {
    path: 'camera-roll',
    component: CameraRollPageComponent,
  },
  { path: 'reports', component: ReportsPageComponent },
  { path: 'pomodoro', component: PomodoroPageComponent },
  {
    path: 'dashboard',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        component: AdminDashboardPageComponent,
      },
      {
        path: 'users',
        component: AdminUsersComponent,
      },
      {
        path: 'roles',
        component: AdminRolesComponent,
      },
      {
        path: 'routines',
        component: AdminRoutinesComponent,
      },
      {
        path: 'scans',
        component: AdminScansComponent,
      },
      {
        path: 'settings',
        component: AdminSettingsComponent,
      },
    ],
  },
];
