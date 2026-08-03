import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page.component';
import { LoginPageComponent } from './pages/login-page.component';
import { RoutinesPageComponent } from './pages/routines-page.component';
import { ScanPageComponent } from './pages/scan-page.component';

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
];
