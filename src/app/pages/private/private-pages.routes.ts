import { Routes } from '@angular/router';
import { PrivatePagesComponent } from './private-pages.component';

export const PRIVATE_PAGES_ROUTES: Routes = [
  {
    path: '',
    component: PrivatePagesComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'events',
      },
      {
        path: 'events',
        loadChildren: () =>
          import('./event-management/event-management.routes').then(
            (m) => m.EVENT_MANAGEMENT_ROUTES
          ),
      },
    ],
  },
];
