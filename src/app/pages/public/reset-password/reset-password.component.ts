import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NoticeService } from '../../../common/services/notice.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  token = '';
  password = '';
  loading = false;

  constructor(
    private _auth: AuthService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _notice: NoticeService
  ) {
    this._route.queryParams.subscribe(params => {
      if (params['token']) {
        this.token = params['token'];
      }
    });
  }

  resetPassword(): void {
    if (!this.password || !this.token) {
      this._notice.showWarningMessage('Token and password are required');
      return;
    }
    this.loading = true;
    this._auth.resetPassword(this.token, this.password).subscribe(() => {
      this.loading = false;
      this._notice.showSuccessMessage('Password reset successfully');
      this._router.navigate(['/login']);
    });
  }
}
