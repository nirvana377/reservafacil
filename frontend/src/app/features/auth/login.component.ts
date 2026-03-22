import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    MatCardModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <mat-icon class="auth-icon">restaurant</mat-icon>
          <h1>Bienvenido</h1>
          <p>Inicia sesión en ReservaFácil</p>
        </div>

        <form (ngSubmit)="onLogin()" #loginForm="ngForm">
          <mat-form-field appearance="outline" class="w-100">
            <mat-label>Correo electrónico</mat-label>
            <input matInput type="email" [(ngModel)]="email"
              name="email" required placeholder="tu@email.com">
            <mat-icon matPrefix>email</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="w-100 mt-1">
            <mat-label>Contraseña</mat-label>
            <input matInput [type]="hidePassword ? 'password' : 'text'"
              [(ngModel)]="password" name="password" required>
            <mat-icon matPrefix>lock</mat-icon>
            <button mat-icon-button matSuffix type="button"
              (click)="hidePassword = !hidePassword">
              <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
          </mat-form-field>

          @if (errorMsg) {
            <div class="error-msg">
              <mat-icon>error_outline</mat-icon>
              {{ errorMsg }}
            </div>
          }

          <button mat-raised-button class="btn-submit w-100 mt-2"
            type="submit" [disabled]="loading">
            @if (loading) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              <mat-icon>login</mat-icon>
              Iniciar Sesión
            }
          </button>
        </form>

        <div class="auth-footer">
          <p>¿No tienes cuenta?
            <a routerLink="/auth/register" class="link">Regístrate aquí</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: calc(100vh - 64px);
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
      padding: 24px;
    }
    .auth-card {
      background: white;
      border-radius: 16px;
      padding: 40px;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    }
    .auth-header {
      text-align: center;
      margin-bottom: 32px;
    }
    .auth-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: var(--primary);
      margin-bottom: 12px;
    }
    .auth-header h1 {
      font-size: 28px;
      font-weight: 700;
      color: var(--slate);
      margin-bottom: 4px;
    }
    .auth-header p { color: var(--text-light); }
    .error-msg {
      background: #fef2f2;
      color: var(--danger);
      padding: 12px 16px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      margin-top: 8px;
    }
    .btn-submit {
      background: var(--primary) !important;
      color: white !important;
      height: 48px;
      font-size: 16px;
      border-radius: 8px !important;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .auth-footer {
      text-align: center;
      margin-top: 24px;
      color: var(--text-light);
    }
    .link { color: var(--primary); font-weight: 600; text-decoration: none; }
    .link:hover { text-decoration: underline; }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  hidePassword = true;
  loading = false;
  errorMsg = '';

  constructor(private auth: AuthService, private router: Router) {}

  onLogin() {
    if (!this.email || !this.password) {
      this.errorMsg = 'Completa todos los campos';
      return;
    }
    this.loading = true;
    this.errorMsg = '';

    this.auth.login(this.email, this.password).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.user.role === 'admin') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Error al iniciar sesión';
      }
    });
  }
}
