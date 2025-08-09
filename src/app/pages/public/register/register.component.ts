import {Component, OnDestroy, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../../core/services/auth.service';
import {RegisterFormModel, RegisterModel} from '../../../common/models/dtos/register.model';
import {FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {HaPanelComponent} from "../../../common/components/ha-panel/ha-panel.component";
import {NzButtonModule} from "ng-zorro-antd/button";
import {NzFormModule} from "ng-zorro-antd/form";
import {NzInputModule} from "ng-zorro-antd/input";
import {RxFormBuilder, RxReactiveFormsModule} from "@rxweb/reactive-form-validators";
import {SharedModule} from '../../../common/shared.module';
import {Subject, takeUntil} from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [SharedModule, HaPanelComponent, FormsModule, ReactiveFormsModule, RxReactiveFormsModule, NzFormModule, NzInputModule,
    NzButtonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit, OnDestroy {

  // States
  readonly passwordVisible = signal(false);
  readonly isSubmitting = signal(false);

  // Variables
  formGroup!: FormGroup;

  // Cleanup
  private readonly destroy$ = new Subject<void>();

  constructor(private _auth: AuthService,
              private _router: Router,
              private _rxFormBuilder: RxFormBuilder,) {
  }

  ngOnInit() {
    this.formGroup = this._rxFormBuilder.formGroup(new RegisterFormModel());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  register(): void {
    if (!this.formGroup.valid || this.isSubmitting()) return;

    this.isSubmitting.set(true);

    const data: RegisterModel = this.formGroup.value;
    this._auth.register(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this._router.navigate(['/login']);
        },
        complete: () => {
          this.isSubmitting.set(false);
        },
      });
  }

  goToLogin(): void {
    this._router.navigate(['/login']);
  }
}
