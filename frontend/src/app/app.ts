import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, CommonModule,
    MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule
  ],
  template: `
    <mat-toolbar class="navbar">
      <div class="nav-brand">
        <mat-icon class="brand-icon">restaurant</mat-icon>
        <span class="brand-name">ReservaFácil</span>
      </div>

      <div class="nav-links">
        <a routerLink="/" mat-button class="nav-link">
          <mat-icon>home</mat-icon> Inicio
        </a>
        <a routerLink="/booking" mat-button class="nav-link">
          <mat-icon>event_seat</mat-icon> Reservar
        </a>

        @if (auth.isLoggedIn()) {
        @if (auth.isAdmin()) {
          <a routerLink="/dashboard" mat-button class="nav-link">
            <mat-icon>dashboard</mat-icon> Dashboard
          </a>
        } @else {
          <a routerLink="/my-reservations" mat-button class="nav-link">
            <mat-icon>list_alt</mat-icon> Mis Reservas
          </a>
        }
        <button mat-button [matMenuTriggerFor]="userMenu" class="nav-link">
          <mat-icon>account_circle</mat-icon> {{ auth.currentUser()?.name }}
        </button>
        <mat-menu #userMenu="matMenu">
          <button mat-menu-item (click)="auth.logout()">
            <mat-icon>logout</mat-icon> Cerrar Sesión
          </button>
        </mat-menu>
        } @else {
          <a routerLink="/auth/login" mat-button class="nav-link">
            <mat-icon>login</mat-icon> Ingresar
          </a>
          <a routerLink="/auth/register" mat-raised-button class="btn-primary nav-cta">
            <mat-icon>person_add</mat-icon> Registrarse
          </a>
        }
      </div>
    </mat-toolbar>

    <main class="main-content">
      <router-outlet />
    </main>
  `,
  styles: [`
    .navbar {
      background: var(--slate) !important;
      color: white !important;
      position: sticky;
      top: 0;
      z-index: 100;
      padding: 0 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: var(--shadow-md);
    }
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }
    .brand-icon { color: var(--primary); font-size: 28px; }
    .brand-name {
      font-size: 20px;
      font-weight: 700;
      color: white;
      letter-spacing: -0.5px;
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .nav-link {
      color: rgba(255,255,255,0.85) !important;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .nav-link:hover { color: white !important; }
    .nav-cta {
      background: var(--primary) !important;
      color: white !important;
      border-radius: var(--radius) !important;
      margin-left: 8px;
    }
    .main-content { min-height: calc(100vh - 64px); }
  `]
})
export class AppComponent {
  constructor(public auth: AuthService) {}
}
