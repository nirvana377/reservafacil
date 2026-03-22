import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReservationService, Reservation } from '../../core/services/reservation.service';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-my-reservations',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule
  ],
  template: `
    <div class="page-wrap">
      <div class="page-header">
        <div class="header-text">
          <h1><mat-icon>list_alt</mat-icon> Mis Reservas</h1>
          <p>Historial de tus reservas en ReservaFácil</p>
        </div>
        <a routerLink="/booking" mat-raised-button class="btn-new">
          <mat-icon>add</mat-icon> Nueva Reserva
        </a>
      </div>

      @if (loading()) {
        <div class="center-box">
          <mat-spinner diameter="48"></mat-spinner>
          <p>Cargando tus reservas...</p>
        </div>
      } @else if (reservations().length === 0) {
        <div class="center-box">
          <mat-icon class="empty-icon">event_busy</mat-icon>
          <h3>No tienes reservas</h3>
          <p>Aún no has realizado ninguna reserva</p>
          <a routerLink="/booking" mat-raised-button class="btn-new" style="margin-top:16px">
            Hacer una Reserva
          </a>
        </div>
      } @else {
        <div class="list">
          @for (r of reservations(); track r.id) {
            <div class="rcard" [ngClass]="r.status">
              <div class="rcard-body">
                <div class="rcard-icon" [ngClass]="r.status">
                  <mat-icon>{{ getStatusIcon(r.status) }}</mat-icon>
                </div>
                <div class="rcard-info">
                  <div class="rdate">{{ r.date | date:'EEEE, d MMMM y':'':'es' }}</div>
                  <div>{{ r.timeStart }} - {{ r.timeEnd }}</div>
                  <div>Mesa {{ r.table?.number }} · {{ r.table?.zone | titlecase }}</div>
                  <div>{{ r.guests }} persona{{ r.guests > 1 ? 's' : '' }}</div>
                  @if (r.notes) {
                    <div class="notes">{{ r.notes }}</div>
                  }
                </div>
              </div>
              <div class="rcard-actions">
                <span class="badge" [ngClass]="r.status">
                  <mat-icon>{{ getStatusIcon(r.status) }}</mat-icon>
                  {{ getStatusLabel(r.status) }}
                </span>
                @if (r.status === 'pending' || r.status === 'confirmed') {
                  <button mat-stroked-button class="btn-cancel" (click)="cancelReservation(r.id)">
                    <mat-icon>cancel</mat-icon> Cancelar
                  </button>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page-wrap {
      max-width: 860px;
      margin: 0 auto;
      padding: 40px 24px;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }
    .header-text h1 {
      font-size: 26px;
      font-weight: 700;
      color: var(--slate);
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 4px 0;
    }
    .header-text h1 mat-icon { color: var(--primary); }
    .header-text p { color: var(--text-light); margin: 0; }
    .btn-new {
      background: var(--primary) !important;
      color: white !important;
      border-radius: 8px !important;
    }
    .center-box {
      text-align: center;
      padding: 60px 24px;
      background: white;
      border-radius: 12px;
      box-shadow: var(--shadow);
    }
    .empty-icon {
      font-size: 56px !important;
      width: 56px !important;
      height: 56px !important;
      color: #cbd5e1;
      display: block;
      margin: 0 auto 16px;
    }
    .center-box h3 { color: var(--slate); margin-bottom: 8px; }
    .center-box p { color: var(--text-light); }
    .list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .rcard {
      background: white;
      border-radius: 12px;
      padding: 20px 24px;
      box-shadow: var(--shadow);
      border-left: 4px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }
    .rcard:hover { box-shadow: var(--shadow-md); }
    .rcard.pending  { border-left-color: #f59e0b; }
    .rcard.confirmed { border-left-color: #059669; }
    .rcard.cancelled { border-left-color: #ef4444; opacity: 0.75; }
    .rcard.completed { border-left-color: #6366f1; }
    .rcard-body {
      display: flex;
      gap: 16px;
      align-items: flex-start;
      flex: 1;
    }
    .rcard-icon {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .rcard-icon.pending  { background: #fef3c7; color: #92400e; }
    .rcard-icon.confirmed { background: #d1fae5; color: #065f46; }
    .rcard-icon.cancelled { background: #fee2e2; color: #991b1b; }
    .rcard-icon.completed { background: #e0e7ff; color: #3730a3; }
    .rcard-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .rcard-info div {
      margin: 0;
      font-size: 14px;
      color: var(--text);
    }
    .rdate {
      font-weight: 600;
      color: var(--slate) !important;
      font-size: 15px !important;
    }
    .notes { color: var(--text-light) !important; font-style: italic; }
    .rcard-actions {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 10px;
      flex-shrink: 0;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
    }
    .badge mat-icon { font-size: 13px !important; width: 13px !important; height: 13px !important; }
    .badge.pending  { background: #fef3c7; color: #92400e; }
    .badge.confirmed { background: #d1fae5; color: #065f46; }
    .badge.cancelled { background: #fee2e2; color: #991b1b; }
    .badge.completed { background: #e0e7ff; color: #3730a3; }
    .btn-cancel {
      color: #ef4444 !important;
      border-color: #ef4444 !important;
      font-size: 13px;
      height: 34px;
    }
  `]
})
export class MyReservationsComponent implements OnInit, OnDestroy {
  reservations = signal<Reservation[]>([]);
  loading = signal(true);
  private sub = new Subscription();

  constructor(
    private reservationService: ReservationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loading.set(true);
    this.reservations.set([]);
    setTimeout(() => { this.loadReservations(); }, 100);

    this.sub.add(
      this.router.events.pipe(
        filter(e => e instanceof NavigationEnd && e.urlAfterRedirects === '/my-reservations')
      ).subscribe(() => {
        this.loading.set(true);
        this.reservations.set([]);
        setTimeout(() => { this.loadReservations(); }, 100);
      })
    );
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  loadReservations() {
    this.loading.set(true);
    this.reservations.set([]);
    this.reservationService.getMyReservations().subscribe({
      next: (data) => {
        this.reservations.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  cancelReservation(id: number) {
    if (!confirm('¿Estás seguro de cancelar esta reserva?')) return;
    this.reservationService.cancelReservation(id).subscribe({
      next: () => this.loadReservations(),
      error: (err) => alert(err.error?.message || 'Error al cancelar')
    });
  }

  getStatusIcon(status: string): string {
    const icons: any = {
      pending: 'pending',
      confirmed: 'check_circle',
      cancelled: 'cancel',
      completed: 'done_all'
    };
    return icons[status] || 'help';
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      cancelled: 'Cancelada',
      completed: 'Completada'
    };
    return labels[status] || status;
  }
}
