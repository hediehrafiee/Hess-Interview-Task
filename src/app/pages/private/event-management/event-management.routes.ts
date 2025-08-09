import { Routes } from '@angular/router';

export const EVENT_MANAGEMENT_ROUTES: Routes = [
  {
    path: '',

    loadComponent: async () =>
      await import('./event-list/event-list.component'),
  },
];
