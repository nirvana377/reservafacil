import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
  template: `
    <div class="hero">
      <div class="hero-content">
        <mat-icon class="hero-icon">restaurant</mat-icon>
        <h1>Reserva tu mesa en segundos</h1>
        <p>Elige fecha, hora y mesa. Confirmación inmediata.</p>
        <a routerLink="/booking" mat-raised-button class="hero-btn">
          <mat-icon>event_seat</mat-icon>
          Hacer una Reserva
        </a>
      </div>
    </div>
  `,
  styles: [`
    .hero {
      min-height: calc(100vh - 64px);
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%);
      text-align: center;
      padding: 24px;
    }
    .hero-content { max-width: 600px; }
    .hero-icon {
      font-size: 72px;
      width: 72px;
      height: 72px;
      color: var(--primary);
      margin-bottom: 24px;
    }
    h1 {
      font-size: 48px;
      font-weight: 800;
      color: var(--slate);
      margin-bottom: 16px;
      line-height: 1.2;
    }
    p {
      font-size: 20px;
      color: var(--text-light);
      margin-bottom: 32px;
    }
    .hero-btn {
      background: var(--primary) !important;
      color: white !important;
      height: 52px;
      font-size: 18px;
      border-radius: 8px !important;
      padding: 0 32px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export class HomeComponent {}
