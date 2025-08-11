// src/app/pages/private/event-management/event-form/event-form.service.ts
import { Injectable, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { EventModel } from '@common/models/event.model';
import { CreateEventModel } from '@common/models/dtos/create-event.model';
import { UpdateEventModel } from '@common/models/dtos/update-event.model';

@Injectable()
export class EventFormService {
  private readonly fb = inject(FormBuilder);

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
    timezone: [this.timeZones, [Validators.required]],
    venueId: ['', [Validators.required, Validators.minLength(2)]],
    primaryImageUrl: [''],
    coverImageUrl: [''],
    isPublic: [true],
  });

  /** Patches the form with existing event data. */
  patchForm(event: EventModel): void {
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
  }

  /** Maps form values to a DTO payload. */
  toPayload(): CreateEventModel | UpdateEventModel {
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

  /** Marks all form controls as touched to show validation errors. */
  markAllAsTouched(): void {
    Object.values(this.form.controls).forEach((control) => {
      control.markAsTouched();
      control.updateValueAndValidity();
    });
  }
}
