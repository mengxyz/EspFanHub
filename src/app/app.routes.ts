import { Routes } from '@angular/router';
import { HomePageComponent } from './route/home-page/home-page.component';
import { RootPageComponent } from './route/root-page/root-page.component';

export const routes: Routes = [
  {
    path: '',
    component: RootPageComponent,
  },
  {
    path: 'home-page/:uid',
    component: HomePageComponent,
  },
];
