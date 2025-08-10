import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';

import { EventService } from '@common/services/event.service';
import { CreateEventModel } from '@common/models/dtos/create-event.model';
import { UpdateEventModel } from '@common/models/dtos/update-event.model';
import { NzUploadFile } from 'ng-zorro-antd/upload';
import { Observable, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpaceModule } from 'ng-zorro-antd/space';

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
  ],
})
export default class EventFormComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private eventService = inject(EventService);

  eventId: string | null = null;
  mode = signal<'create' | 'edit'>('create');

  form = this.fb.group({
    title: ['', [Validators.required]],
    description: [''],
    startDateTime: [null as Date | null, [Validators.required]],
    timezone: ['UTC', [Validators.required]],
    venueId: ['', [Validators.required]],
    primaryImageUrl: [''],
    coverImageUrl: [''],
    isPublic: [true],
  });

  primaryImageList: NzUploadFile[] = [];
  coverImageList: NzUploadFile[] = [];

  timeZones = (Intl as any).supportedValuesOf
    ? (Intl as any).supportedValuesOf('timeZone')
    : ['UTC'];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eventId = id;
      this.mode.set('edit');
      this.eventService
        .findOne(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((event) => {
          if (!event) return;
          this.form.patchValue({
            title: event.title,
            description: event.description,
            startDateTime: event.startDateTime
              ? new Date(event.startDateTime)
              : null,
            timezone: event.timezone,
            venueId: event.venueId,
            primaryImageUrl: event.primaryImageUrl ?? '',
            coverImageUrl: event.coverImageUrl ?? '',
            isPublic: event.isPublic ?? true,
          });
          if (event.primaryImageUrl) {
            this.primaryImageList = [
              {
                uid: '-1',
                name: 'primary',
                status: 'done',
                url: event.primaryImageUrl,
              },
            ];
          }
          if (event.coverImageUrl) {
            this.coverImageList = [
              {
                uid: '-1',
                name: 'cover',
                status: 'done',
                url: event.coverImageUrl,
              },
            ];
          }
        });
    }
  }

  beforePrimaryUpload = (file: NzUploadFile): boolean => {
    this.readFile(file, (url) => {
      this.form.patchValue({ primaryImageUrl: url });
      this.primaryImageList = [file];
    });
    return false;
  };

  beforeCoverUpload = (file: NzUploadFile): boolean => {
    this.readFile(file, (url) => {
      this.form.patchValue({ coverImageUrl: url });
      this.coverImageList = [file];
    });
    return false;
  };

  private readFile(file: NzUploadFile, cb: (url: string) => void) {
    const reader = new FileReader();
    reader.addEventListener('load', () => cb(reader.result as string));
    reader.readAsDataURL(file as unknown as File);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.value;
    const payload: CreateEventModel | UpdateEventModel = {
      title: value.title!,
      venueId: value.venueId!,
      startDateTime: value.startDateTime!.toISOString(),
      endDateTime: value.startDateTime!.toISOString(),
      timezone: value.timezone!,
      description: value.description || undefined,
      primaryImageUrl: value.primaryImageUrl || undefined,
      coverImageUrl: value.coverImageUrl || undefined,
      isPublic: value.isPublic ?? true,
    };
    let request$: Observable<any>;
    if (this.mode() === 'edit' && this.eventId) {
      request$ = this.eventService.update(
        this.eventId,
        payload as UpdateEventModel
      );
    } else {
      request$ = this.eventService.create(payload as CreateEventModel);
    }
    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }
}
