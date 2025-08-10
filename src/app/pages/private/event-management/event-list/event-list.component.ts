import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzEmptyModule } from 'ng-zorro-antd/empty';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { SharedModule } from '@common/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { EventStateService } from '@core/services/event.state.service';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [
    SharedModule,
    ReactiveFormsModule,
    NzCardModule,
    NzButtonModule,
    NzInputModule,
    NzSelectModule,
    NzTableModule,
    NzTagModule,
    NzSpaceModule,
    NzPopconfirmModule,
    NzEmptyModule,
    NzIconModule,
  ],
  templateUrl: './event-list.component.html',
  styleUrls: ['./event-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EventListComponent {
  readonly vm = inject(EventStateService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.vm.load();
  }

  edit(id?: string) {
    if (id) this.router.navigate(['./', id, 'edit']);
  }
  create(): void {
    this.router.navigate(['./', 'new']);
  }
  remove(id?: string) {
    if (id) this.vm.remove(id);
  }
}
