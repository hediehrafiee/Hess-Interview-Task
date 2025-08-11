import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
  OnInit,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzSpinModule } from 'ng-zorro-antd/spin';

import { EventStateService } from '@core/services/event/event.state.service';
import { EventMode } from '@common/Enums/event.enum';
import { ImageHandler } from '@common/utilities/image-handler.utility';
import { EventModel } from '@common/models/event.model';
import { CreateEventModel } from '@common/models/dtos/create-event.model';
import { UpdateEventModel } from '@common/models/dtos/update-event.model';
import { Observable } from 'rxjs';
import { EventFormService } from '../../../../core/services/event/event-form.service';

/**
 * A reactive form component for creating and updating events.
 * It focuses on UI logic and delegates state management to a dedicated service.
 */
@Component({
  selector: 'app-event-form',
  standalone: true,
  templateUrl: './event-form.component.html',
  styleUrls: ['./event-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [EventFormService],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzDatePickerModule,
    NzUploadModule,
    NzSwitchModule,
    NzSelectModule,
    NzCardModule,
    NzGridModule,
    NzIconModule,
    NzSpaceModule,
    NzSpinModule,
  ],
})
export default class EventFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  readonly eventForm = inject(EventFormService);
  readonly eventState = inject(EventStateService);

  eventId: string | null = null;
  mode = signal<EventMode>(EventMode.CREATE);

  readonly timeZones = this.eventForm.timeZones;

  primaryImageHandler = new ImageHandler(
    this.eventForm.form.controls.primaryImageUrl
  );
  coverImageHandler = new ImageHandler(
    this.eventForm.form.controls.coverImageUrl
  );

  constructor() {
    effect(() => {
      const event = this.eventState.eventDetail();
      console.log(event);
      if (event) {
        this.eventForm.patchForm(event);
        this.eventId = event.id || null;
        this.mode.set(EventMode.EDIT);

        this.primaryImageHandler.createInitialFile(
          event.primaryImageUrl,
          'primary-image'
        );
        this.coverImageHandler.createInitialFile(
          event.coverImageUrl,
          'cover-image'
        );
      }
    });
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eventState.loadOne(id);
    } else {
      this.eventState.eventDetail.set(null);
      this.mode.set(EventMode.CREATE);
    }
  }

  submit(): void {
    if (this.eventForm.form.invalid) {
      this.eventForm.markAllAsTouched();
      this.eventState.message.warning(
        'Please fill in all required fields correctly.'
      );
      return;
    }

    this.eventState
      .submitEvent(
        this.eventForm.toPayload(),
        this.mode(),
        this.eventId ?? undefined
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.navigateToList());
  }

  cancel(): void {
    this.navigateToList();
  }

  private navigateToList(): void {
    this.router.navigate(['p/events']);
  }
}
