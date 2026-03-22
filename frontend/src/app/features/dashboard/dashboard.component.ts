import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ReservationService, Reservation } from '../../core/services/reservation.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatSelectModule, MatFormFieldModule, MatInputModule,
    MatChipsModule, MatCardModule, MatProgressSpinnerModule,
    MatTooltipModule
  ],
  template: `
    <div class="dashboard-container">

      <!-- Header -->
      <div class="dashboard-header">
        <div>
          <h1><mat-icon>dashboard</mat-icon> Panel de Administración</h1>
          <p>Gestiona las reservas del restaurante</p>
        </div>
        <div class="header-date">
          <mat-icon>calendar_today</mat-icon>
          {{ today | date:'EEEE, d MMMM y':'':'es' }}
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <mat-icon class="stat-icon pending">pending</mat-icon>
          <div class="stat-info">
            <span class="stat-number">{{ pendingCount() }}</span>
            <span class="stat-label">Pendientes</span>
          </div>
        </div>
        <div class="stat-card">
          <mat-icon class="stat-icon confirmed">check_circle</mat-icon>
          <div class="stat-info">
            <span class="stat-number">{{ confirmedCount() }}</span>
            <span class="stat-label">Confirmadas</span>
          </div>
        </div>
        <div class="stat-card">
          <mat-icon class="stat-icon cancelled">cancel</mat-icon>
          <div class="stat-info">
            <span class="stat-number">{{ cancelledCount() }}</span>
            <span class="stat-label">Canceladas</span>
          </div>
        </div>
        <div class="stat-card">
          <mat-icon class="stat-icon total">bar_chart</mat-icon>
          <div class="stat-info">
            <span class="stat-number">{{ reservations().length }}</span>
            <span class="stat-label">Total</span>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="filters-bar">
        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Filtrar por fecha</mat-label>
          <input matInput type="date" [(ngModel)]="filterDate" (change)="loadReservations()">
          <mat-icon matPrefix>calendar_today</mat-icon>
          @if (filterDate) {
            <button matSuffix mat-icon-button (click)="filterDate=''; loadReservations()">
              <mat-icon>close</mat-icon>
            </button>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" class="filter-field">
          <mat-label>Estado</mat-label>
          <mat-select [(ngModel)]="filterStatus" (selectionChange)="loadReservations()">
            <mat-option value="">Todos</mat-option>
            <mat-option value="pending">Pendientes</mat-option>
            <mat-option value="confirmed">Confirmadas</mat-option>
            <mat-option value="cancelled">Canceladas</mat-option>
            <mat-option value="completed">Completadas</mat-option>
          </mat-select>
          <mat-icon matPrefix>filter_list</mat-icon>
        </mat-form-field>

        <button mat-raised-button class="btn-refresh" (click)="loadReservations()">
          <mat-icon>refresh</mat-icon> Actualizar
        </button>
      </div>

      <!-- Tabla de reservas -->
      @if (loading()) {
        <div class="loading-state">
          <mat-spinner diameter="48"></mat-spinner>
          <p>Cargando reservas...</p>
        </div>
      } @else if (reservations().length === 0) {
        <div class="empty-state">
          <mat-icon>event_busy</mat-icon>
          <h3>No hay reservas</h3>
          <p>No se encontraron reservas con los filtros aplicados</p>
        </div>
      } @else {
        <div class="table-wrapper">
          <table mat-table [dataSource]="reservations()" class="reservations-table">

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Estado</th>
              <td mat-cell *matCellDef="let r">
                <span class="status-badge" [class]="r.status">
                  <mat-icon>{{ getStatusIcon(r.status) }}</mat-icon>
                  {{ getStatusLabel(r.status) }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="guest">
              <th mat-header-cell *matHeaderCellDef>Cliente</th>
              <td mat-cell *matCellDef="let r">
                <div class="guest-info">
                  <span class="guest-name">{{ r.guestName }}</span>
                  <span class="guest-email">{{ r.guestEmail }}</span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="datetime">
              <th mat-header-cell *matHeaderCellDef>Fecha y Hora</th>
              <td mat-cell *matCellDef="let r">
                <div class="datetime-info">
                  <span><mat-icon>calendar_today</mat-icon> {{ r.date | date:'dd/MM/yyyy' }}</span>
                  <span><mat-icon>schedule</mat-icon> {{ r.timeStart }} - {{ r.timeEnd }}</span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="table">
              <th mat-header-cell *matHeaderCellDef>Mesa</th>
              <td mat-cell *matCellDef="let r">
                <div class="table-info">
                  <mat-icon>table_restaurant</mat-icon>
                  Mesa {{ r.table?.number }}
                  <span class="zone-badge">{{ r.table?.zone }}</span>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="guests">
              <th mat-header-cell *matHeaderCellDef>Personas</th>
              <td mat-cell *matCellDef="let r">
                <span class="guests-count">
                  <mat-icon>group</mat-icon> {{ r.guests }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Acciones</th>
              <td mat-cell *matCellDef="let r">
                <div class="action-btns">
                  @if (r.status === 'pending') {
                    <button mat-icon-button class="btn-confirm"
                      matTooltip="Confirmar reserva"
                      (click)="updateStatus(r.id, 'confirmed')">
                      <mat-icon>check_circle</mat-icon>
                    </button>
                    <button mat-icon-button class="btn-cancel"
                      matTooltip="Cancelar reserva"
                      (click)="updateStatus(r.id, 'cancelled')">
                      <mat-icon>cancel</mat-icon>
                    </button>
                  }
                  @if (r.status === 'confirmed') {
                    <button mat-icon-button class="btn-complete"
                      matTooltip="Marcar como completada"
                      (click)="updateStatus(r.id, 'completed')">
                      <mat-icon>done_all</mat-icon>
                    </button>
                    <button mat-icon-button class="btn-cancel"
                      matTooltip="Cancelar reserva"
                      (click)="updateStatus(r.id, 'cancelled')">
                      <mat-icon>cancel</mat-icon>
                    </button>
                  }
                  @if (r.notes) {
                    <button mat-icon-button class="btn-notes"
                      [matTooltip]="r.notes">
                      <mat-icon>note</mat-icon>
                    </button>
                  }
                </div>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"
              class="table-row"></tr>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 32px 24px;
    }
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
    }
    .dashboard-header h1 {
      font-size: 28px;
      font-weight: 700;
      color: var(--slate);
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 4px;
    }
    .dashboard-header h1 mat-icon { color: var(--primary); }
    .dashboard-header p { color: var(--text-light); }
    .header-date {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--text-light);
      font-size: 14px;
      background: white;
      padding: 8px 16px;
      border-radius: 8px;
      box-shadow: var(--shadow);
    }
    .header-date mat-icon { color: var(--primary); font-size: 18px; }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: var(--shadow);
    }
    .stat-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
    }
    .stat-icon.pending { color: var(--warning); }
    .stat-icon.confirmed { color: var(--primary); }
    .stat-icon.cancelled { color: var(--danger); }
    .stat-icon.total { color: var(--slate); }
    .stat-info { display: flex; flex-direction: column; }
    .stat-number { font-size: 28px; font-weight: 700; color: var(--slate); }
    .stat-label { font-size: 13px; color: var(--text-light); }

    .filters-bar {
      display: flex;
      gap: 16px;
      align-items: center;
      margin-bottom: 24px;
      background: white;
      padding: 16px;
      border-radius: 12px;
      box-shadow: var(--shadow);
    }
    .filter-field { flex: 1; }
    .btn-refresh {
      background: var(--slate) !important;
      color: white !important;
      height: 48px;
      border-radius: 8px !important;
      white-space: nowrap;
    }

    .loading-state, .empty-state {
      text-align: center;
      padding: 64px;
      background: white;
      border-radius: 12px;
      box-shadow: var(--shadow);
    }
    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: var(--border);
      margin-bottom: 16px;
    }
    .empty-state h3 { color: var(--slate); margin-bottom: 8px; }
    .empty-state p { color: var(--text-light); }

    .table-wrapper {
      background: white;
      border-radius: 12px;
      box-shadow: var(--shadow);
      overflow: hidden;
    }
    .reservations-table { width: 100%; }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    .status-badge mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .status-badge.pending { background: #fef3c7; color: #92400e; }
    .status-badge.confirmed { background: #d1fae5; color: #065f46; }
    .status-badge.cancelled { background: #fee2e2; color: #991b1b; }
    .status-badge.completed { background: #e0e7ff; color: #3730a3; }

    .guest-info { display: flex; flex-direction: column; }
    .guest-name { font-weight: 600; color: var(--slate); font-size: 14px; }
    .guest-email { color: var(--text-light); font-size: 12px; }

    .datetime-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
      font-size: 13px;
    }
    .datetime-info span {
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--text);
    }
    .datetime-info mat-icon { font-size: 14px; width: 14px; height: 14px; color: var(--primary); }

    .table-info {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
    }
    .table-info mat-icon { color: var(--primary); font-size: 18px; }
    .zone-badge {
      background: var(--gray);
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 11px;
      color: var(--text-light);
    }

    .guests-count {
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 600;
      color: var(--slate);
    }
    .guests-count mat-icon { color: var(--primary); font-size: 18px; }

    .action-btns { display: flex; gap: 4px; }
    .btn-confirm { color: var(--primary) !important; }
    .btn-cancel { color: var(--danger) !important; }
    .btn-complete { color: #6366f1 !important; }
    .btn-notes { color: var(--warning) !important; }

    .table-row:hover { background: var(--gray); }
  `]
})
export class DashboardComponent implements OnInit {
  reservations = signal<Reservation[]>([]);
  loading = signal(false);
  filterDate = '';
  filterStatus = '';
  today = new Date();

  displayedColumns = ['status', 'guest', 'datetime', 'table', 'guests', 'actions'];

  pendingCount = signal(0);
  confirmedCount = signal(0);
  cancelledCount = signal(0);

  constructor(private reservationService: ReservationService) {}

  ngOnInit() {
    this.loadReservations();
  }

  loadReservations() {
    this.loading.set(true);
    this.reservationService.getAllReservations(this.filterDate, this.filterStatus)
      .subscribe({
        next: (data) => {
          this.reservations.set(data);
          this.pendingCount.set(data.filter(r => r.status === 'pending').length);
          this.confirmedCount.set(data.filter(r => r.status === 'confirmed').length);
          this.cancelledCount.set(data.filter(r => r.status === 'cancelled').length);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      });
  }

  updateStatus(id: number, status: string) {
    this.reservationService.updateStatus(id, status).subscribe({
      next: () => this.loadReservations(),
      error: (err) => console.error(err)
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
