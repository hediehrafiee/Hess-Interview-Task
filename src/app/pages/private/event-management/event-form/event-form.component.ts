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
  readonly eventState = inject(EventStateService);

  eventId: string | null = null;
  mode = signal<EventMode>(EventMode.CREATE);

  readonly timeZones = (Intl as any).supportedValuesOf?.('timeZone') ?? ['UTC'];
  private readonly defaultTz =
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

  form = this.fb.group({
    title: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(200)],
    ],
    description: ['', [Validators.maxLength(1000)]],
    startDateTime: [null as Date | null, [Validators.required]],
    timezone: [this.defaultTz, [Validators.required]],
    venueId: ['', [Validators.required, Validators.minLength(2)]],
    primaryImageUrl: [''],
    coverImageUrl: [''],
    isPublic: [true],
  });

  primaryImageHandler = new ImageHandler(this.form.controls.primaryImageUrl);
  coverImageHandler = new ImageHandler(this.form.controls.coverImageUrl);

  constructor() {
    effect(() => {
      const event = this.eventState.eventDetail();
      if (event) {
        this.patchForm(event);
        this.eventId = event.id || null;
        this.mode.set(EventMode.EDIT);
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
    if (this.form.invalid) {
      this.markAllAsTouched();
      this.eventState.message.warning(
        'Please fill in all required fields correctly.'
      );
      return;
    }

    this.eventState
      .submitEvent(this.toPayload(), this.mode(), this.eventId ?? undefined)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.navigateToList());
  }

  cancel(): void {
    this.navigateToList();
  }

  private patchForm(event: EventModel): void {
    this.form.patchValue({
      title: event.title,
      description: event.description,
      startDateTime: event.startDateTime ? new Date(event.startDateTime) : null,
      timezone: event.timezone ?? this.defaultTz,
      venueId: event.venueId,
      primaryImageUrl: event.primaryImageUrl,
      coverImageUrl: event.coverImageUrl,
      isPublic: event.isPublic,
    });
    this.primaryImageHandler.createInitialFile(
      event.primaryImageUrl,
      'primary-image'
    );
    this.coverImageHandler.createInitialFile(
      event.coverImageUrl,
      'cover-image'
    );
  }

  private toPayload(): CreateEventModel | UpdateEventModel {
    const {
      title,
      venueId,
      startDateTime,
      timezone,
      description,
      primaryImageUrl,
      coverImageUrl,
      isPublic,
    } = this.form.value;

    const startIso = startDateTime!.toISOString();

    return {
      title: title!.trim(),
      venueId: venueId!.trim(),
      startDateTime: startIso,
      endDateTime: startIso,
      timezone: timezone!,
      description: description?.trim(),
      primaryImageUrl: primaryImageUrl || undefined,
      coverImageUrl: coverImageUrl || undefined,
      isPublic: isPublic ?? true,
    };
  }

  private markAllAsTouched(): void {
    Object.values(this.form.controls).forEach((control) => {
      control.markAsTouched();
      control.updateValueAndValidity();
    });
  }

  private navigateToList(): void {
    this.router.navigate(['p/events']);
  }
}
