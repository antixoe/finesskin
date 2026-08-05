import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page.component';
import { LoginPageComponent } from './pages/login-page.component';
import { RoutinesPageComponent } from './pages/routines-page.component';
import { ScanPageComponent } from './pages/scan-page.component';
import { AdminLayoutComponent } from './pages/admin-layout.component';
import { AdminDashboardPageComponent } from './pages/admin-dashboard-page.component';
import { AdminUsersComponent } from './pages/admin-users.component';
import { AdminRolesComponent } from './pages/admin-roles.component';
import { AdminRoutinesComponent } from './pages/admin-routines.component';
import { AdminScansComponent } from './pages/admin-scans.component';
import { AdminSettingsComponent } from './pages/admin-settings.component';

export const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
  },
  {
    path: 'scan',
    component: ScanPageComponent,
  },
  {
    path: 'login',
    component: LoginPageComponent,
  },
  {
    path: 'routines',
    component: RoutinesPageComponent,
  },
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
