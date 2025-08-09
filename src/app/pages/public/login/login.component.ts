import {Component, OnDestroy, OnInit, signal} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../../core/services/auth.service';
import {LoginFormModel, LoginModel} from '../../../common/models/dtos/login.model';
import {NoticeService} from '../../../common/services/notice.service';
import {HaPanelComponent} from '../../../common/components/ha-panel/ha-panel.component';
import {FormGroup, FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RxFormBuilder, RxReactiveFormsModule} from '@rxweb/reactive-form-validators';
import {Subject, takeUntil} from 'rxjs';
import {SharedModule} from '../../../common/shared.module';
import {NzFormModule} from 'ng-zorro-antd/form';
import {NzInputModule} from 'ng-zorro-antd/input';
import {NzButtonModule} from 'ng-zorro-antd/button';

@Component({
  selector: 'app-login',
  imports: [SharedModule, HaPanelComponent, FormsModule, ReactiveFormsModule, RxReactiveFormsModule, NzFormModule, NzInputModule,
  NzButtonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit, OnDestroy {

  // States
  readonly passwordVisible = signal(false);
  readonly isSubmitting = signal(false);

  // Variables
  formGroup!: FormGroup;

  // Cleanup
  private readonly destroy$ = new Subject<void>();

  constructor(
    private _auth: AuthService,
    private _router: Router,
    private _notice: NoticeService,
    private _rxFormBuilder: RxFormBuilder,
  ) {
  }

  ngOnInit() {
    this.formGroup = this._rxFormBuilder.formGroup(new LoginFormModel());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  login(): void {
    if (!this.formGroup.valid || this.isSubmitting()) return;

    this.isSubmitting.set(true);

    const data: LoginModel = this.formGroup.value;
    this._auth.login(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this._router.navigate(["/p/dashboard"]);
        },
        complete: () => {
          this.isSubmitting.set(false);
        },
      });
  }

  forgotPassword(): void {
    const email = this.formGroup.value.email;
    if (!email) {
      this._notice.showWarningMessage('Email is required');
      return;
    }
    this._auth.forgotPassword(email)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this._notice.showSuccessMessage('Password reset link sent to your email inbox.');
      });
  }

  goToRegister(): void {
    this._router.navigate(['/register']);
  }
}
