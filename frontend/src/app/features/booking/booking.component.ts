import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { ReservationService, Table, AvailabilityResult } from '../../core/services/reservation.service';
import { AuthService } from '../../core/services/auth.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    MatStepperModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSelectModule,
    MatCardModule, MatProgressSpinnerModule, MatChipsModule,
    MatDatepickerModule, MatNativeDateModule
  ],
  template: `
    <div class="booking-container">
      <div class="booking-header">
        <mat-icon class="booking-icon">event_seat</mat-icon>
        <h1>Hacer una Reserva</h1>
        <p>Sigue los pasos para reservar tu mesa</p>
      </div>

      <!-- PASO 1: Fecha, hora y personas -->
      @if (step() === 1) {
        <div class="step-card">
          <div class="step-header">
            <div class="step-badge">1</div>
            <div>
              <h2>Elige fecha y hora</h2>
              <p>Selecciona cuándo quieres venir</p>
            </div>
          </div>

          <div class="form-grid">
            <mat-form-field appearance="outline">
            <mat-label>Fecha</mat-label>
            <input matInput [matDatepicker]="picker"
              [(ngModel)]="searchDateObj" name="date"
              [min]="todayDate" readonly>
            <mat-icon matPrefix>calendar_today</mat-icon>
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Hora</mat-label>
              <mat-select [(ngModel)]="searchTime" name="time">
                @for (slot of timeSlots; track slot) {
                  <mat-option [value]="slot">{{ slot }}</mat-option>
                }
              </mat-select>
              <mat-icon matPrefix>schedule</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Número de personas</mat-label>
              <mat-select [(ngModel)]="searchGuests" name="guests">
                @for (n of [1,2,3,4,5,6,7,8]; track n) {
                  <mat-option [value]="n">{{ n }} persona{{ n > 1 ? 's' : '' }}</mat-option>
                }
              </mat-select>
              <mat-icon matPrefix>group</mat-icon>
            </mat-form-field>
          </div>

          @if (errorMsg()) {
            <div class="error-msg">
              <mat-icon>error_outline</mat-icon> {{ errorMsg() }}
            </div>
          }

          <button mat-raised-button class="btn-next"
            (click)="searchAvailability()" [disabled]="loading()">
            @if (loading()) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              <mat-icon>search</mat-icon>
              Buscar Mesas Disponibles
            }
          </button>
        </div>
      }

      <!-- PASO 2: Seleccionar mesa -->
      @if (step() === 2) {
        <div class="step-card">
          <div class="step-header">
            <div class="step-badge">2</div>
            <div>
              <h2>Selecciona tu mesa</h2>
              <p>{{ availability()?.availableTables?.length }} mesas disponibles
                el {{ formatDate(searchDate) }} a las {{ searchTime }}</p>
            </div>
          </div>

          <div class="tables-grid">
            @for (table of availability()?.availableTables; track table.id) {
              <div class="table-card" [class.selected]="selectedTable()?.id === table.id"
                (click)="selectTable(table)">
                <mat-icon class="table-icon">table_restaurant</mat-icon>
                <div class="table-info">
                  <span class="table-number">Mesa {{ table.number }}</span>
                  <span class="table-capacity">
                    <mat-icon>group</mat-icon> {{ table.capacity }} personas
                  </span>
                  <span class="table-zone">
                    <mat-icon>location_on</mat-icon> {{ table.zone | titlecase }}
                  </span>
                </div>
                @if (selectedTable()?.id === table.id) {
                  <mat-icon class="check-icon">check_circle</mat-icon>
                }
              </div>
            }
          </div>

          <div class="step-actions">
            <button mat-button (click)="step.set(1)">
              <mat-icon>arrow_back</mat-icon> Volver
            </button>
            <button mat-raised-button class="btn-next"
              (click)="step.set(3)" [disabled]="!selectedTable()">
              Continuar <mat-icon>arrow_forward</mat-icon>
            </button>
          </div>
        </div>
      }

      <!-- PASO 3: Datos del cliente -->
      @if (step() === 3) {
        <div class="step-card">
          <div class="step-header">
            <div class="step-badge">3</div>
            <div>
              <h2>Tus datos</h2>
              <p>Mesa {{ selectedTable()?.number }} · {{ searchGuests }} personas · {{ searchTime }}</p>
            </div>
          </div>

          <div class="form-grid">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Nombre completo</mat-label>
              <input matInput [(ngModel)]="guestName" name="guestName" required>
              <mat-icon matPrefix>person</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Correo electrónico</mat-label>
              <input matInput type="email" [(ngModel)]="guestEmail" name="guestEmail" required>
              <mat-icon matPrefix>email</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Teléfono</mat-label>
              <input matInput [(ngModel)]="guestPhone" name="guestPhone">
              <mat-icon matPrefix>phone</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Notas especiales (opcional)</mat-label>
              <textarea matInput [(ngModel)]="notes" rows="3"
                placeholder="Alergias, ocasión especial, etc."></textarea>
              <mat-icon matPrefix>note</mat-icon>
            </mat-form-field>
          </div>

          @if (errorMsg()) {
            <div class="error-msg">
              <mat-icon>error_outline</mat-icon> {{ errorMsg() }}
            </div>
          }

          <div class="step-actions">
            <button mat-button (click)="step.set(2)">
              <mat-icon>arrow_back</mat-icon> Volver
            </button>
            <button mat-raised-button class="btn-next"
              (click)="confirmReservation()" [disabled]="loading()">
              @if (loading()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                <mat-icon>check_circle</mat-icon>
                Confirmar Reserva
              }
            </button>
          </div>
        </div>
      }

      <!-- PASO 4: Confirmación -->
      @if (step() === 4) {
        <div class="step-card success-card">
          <mat-icon class="success-icon">check_circle</mat-icon>
          <h2>¡Reserva Realizada!</h2>
          <p>Tu reserva ha sido enviada y está pendiente de confirmación.</p>

          <div class="reservation-summary">
            <div class="summary-item">
              <mat-icon>calendar_today</mat-icon>
              <span>{{ formatDate(searchDate) }}</span>
            </div>
            <div class="summary-item">
              <mat-icon>schedule</mat-icon>
              <span>{{ searchTime }} - {{ availability()?.timeEnd }}</span>
            </div>
            <div class="summary-item">
              <mat-icon>table_restaurant</mat-icon>
              <span>Mesa {{ selectedTable()?.number }} · {{ selectedTable()?.zone | titlecase }}</span>
            </div>
            <div class="summary-item">
              <mat-icon>group</mat-icon>
              <span>{{ searchGuests }} personas</span>
            </div>
            <div class="summary-item">
              <mat-icon>person</mat-icon>
              <span>{{ guestName }}</span>
            </div>
          </div>

          <div class="success-actions">
            <button mat-raised-button class="btn-next" routerLink="/">
              <mat-icon>home</mat-icon> Ir al Inicio
            </button>
            <button mat-button (click)="resetForm()">
              <mat-icon>add</mat-icon> Nueva Reserva
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .booking-container {
      max-width: 720px;
      margin: 0 auto;
      padding: 40px 24px;
    }
    .booking-header {
      text-align: center;
      margin-bottom: 32px;
    }
    .booking-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: var(--primary);
      margin-bottom: 12px;
    }
    .booking-header h1 {
      font-size: 32px;
      font-weight: 700;
      color: var(--slate);
    }
    .booking-header p { color: var(--text-light); }

    .step-card {
      background: white;
      border-radius: 16px;
      padding: 32px;
      box-shadow: var(--shadow-md);
    }
    .step-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 28px;
    }
    .step-badge {
      width: 40px;
      height: 40px;
      background: var(--primary);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 700;
      flex-shrink: 0;
    }
    .step-header h2 {
      font-size: 20px;
      font-weight: 600;
      color: var(--slate);
      margin-bottom: 2px;
    }
    .step-header p { color: var(--text-light); font-size: 14px; }

    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }
    .full-width { grid-column: 1 / -1; }

    .tables-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .table-card {
      border: 2px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      cursor: pointer;
      transition: all 0.2s;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
    .table-card:hover {
      border-color: var(--primary);
      box-shadow: var(--shadow-md);
    }
    .table-card.selected {
      border-color: var(--primary);
      background: var(--primary-light);
    }
    .table-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: var(--primary);
    }
    .table-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }
    .table-number {
      font-size: 16px;
      font-weight: 600;
      color: var(--slate);
    }
    .table-capacity, .table-zone {
      font-size: 13px;
      color: var(--text-light);
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .table-capacity mat-icon, .table-zone mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }
    .check-icon {
      color: var(--primary);
      position: absolute;
      top: 8px;
      right: 8px;
    }

    .step-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 24px;
    }
    .btn-next {
      background: var(--primary) !important;
      color: white !important;
      height: 48px;
      padding: 0 24px;
      border-radius: 8px !important;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 15px;
    }
    .error-msg {
      background: #fef2f2;
      color: var(--danger);
      padding: 12px 16px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      margin-bottom: 16px;
    }

    .success-card {
      text-align: center;
      padding: 48px 32px;
    }
    .success-icon {
      font-size: 72px;
      width: 72px;
      height: 72px;
      color: var(--primary);
      margin-bottom: 16px;
    }
    .success-card h2 {
      font-size: 28px;
      font-weight: 700;
      color: var(--slate);
      margin-bottom: 8px;
    }
    .success-card p { color: var(--text-light); margin-bottom: 32px; }
    .reservation-summary {
      background: var(--gray);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 32px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      text-align: left;
    }
    .summary-item {
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--text);
    }
    .summary-item mat-icon { color: var(--primary); }
    .success-actions {
      display: flex;
      gap: 16px;
      justify-content: center;
    }
  `]
})
export class BookingComponent {
  step = signal(1);
  loading = signal(false);
  errorMsg = signal('');
  availability = signal<AvailabilityResult | null>(null);
  selectedTable = signal<Table | null>(null);

  searchDate = '';
  searchDateObj: Date | null = null;
  today = new Date().toISOString().split('T')[0];
  todayDate = new Date();

  searchTime = '19:00';
  searchGuests = 2;
  guestName = '';
  guestEmail = '';
  guestPhone = '';
  notes = '';


  timeSlots = [
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
    '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'
  ];

  constructor(
    private reservationService: ReservationService,
    private authService: AuthService
  ) {
    const user = this.authService.currentUser();
    if (user) {
      this.guestName = user.name;
      this.guestEmail = user.email;
    }
  }

  searchAvailability() {
  if (!this.searchDateObj || !this.searchTime || !this.searchGuests) {
    this.errorMsg.set('Completa todos los campos');
    return;
    }
    const d = this.searchDateObj;
    this.searchDate = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

    this.loading.set(true);
    this.errorMsg.set('');

    this.reservationService.getAvailability(this.searchDate, this.searchGuests, this.searchTime)
      .subscribe({
        next: (result) => {
          this.loading.set(false);
          this.availability.set(result);
          if (result.availableTables.length === 0) {
            this.errorMsg.set('No hay mesas disponibles para esa fecha y hora. Intenta otro horario.');
            return;
          }
          this.step.set(2);
        },
        error: () => {
          this.loading.set(false);
          this.errorMsg.set('Error al buscar disponibilidad');
        }
      });
  }

  selectTable(table: Table) {
    this.selectedTable.set(table);
  }

  confirmReservation() {
    if (!this.guestName || !this.guestEmail) {
      this.errorMsg.set('Nombre y email son requeridos');
      return;
    }
    this.loading.set(true);
    this.errorMsg.set('');

    const data = {
      date: this.searchDate,
      timeStart: this.searchTime,
      guests: this.searchGuests,
      guestName: this.guestName,
      guestEmail: this.guestEmail,
      guestPhone: this.guestPhone,
      notes: this.notes,
      tableId: this.selectedTable()!.id
    };

    this.reservationService.createReservation(data).subscribe({
      next: () => {
        this.loading.set(false);
        this.step.set(4);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMsg.set(err.error?.message || 'Error al crear la reserva');
      }
    });
  }

  formatDate(date: string): string {
    if (!date) return '';
    const d = new Date(date + 'T12:00:00');
    return d.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  resetForm() {
    this.step.set(1);
    this.selectedTable.set(null);
    this.availability.set(null);
    this.searchDate = '';
    this.notes = '';
    this.errorMsg.set('');
  }
}
