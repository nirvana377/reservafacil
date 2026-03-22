import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AvailabilityResult {
  date: string;
  timeStart: string;
  timeEnd: string;
  guests: number;
  availableTables: Table[];
}

export interface Table {
  id: number;
  number: number;
  capacity: number;
  zone: string;
  isActive: boolean;
}

export interface Reservation {
  id: number;
  date: string;
  timeStart: string;
  timeEnd: string;
  guests: number;
  status: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  notes: string;
  table: Table;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private apiUrl = 'http://localhost:3001/api';

  constructor(private http: HttpClient) {}

  getAvailability(date: string, guests: number, time: string): Observable<AvailabilityResult> {
    return this.http.get<AvailabilityResult>(
      `${this.apiUrl}/reservations/availability?date=${date}&guests=${guests}&time=${time}`
    );
  }

  createReservation(data: any): Observable<Reservation> {
    return this.http.post<Reservation>(`${this.apiUrl}/reservations`, data);
  }

  getMyReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/reservations/my`);
  }

  getAllReservations(date?: string, status?: string): Observable<Reservation[]> {
    let url = `${this.apiUrl}/reservations`;
    const params = [];
    if (date) params.push(`date=${date}`);
    if (status) params.push(`status=${status}`);
    if (params.length) url += '?' + params.join('&');
    return this.http.get<Reservation[]>(url);
  }

  updateStatus(id: number, status: string): Observable<Reservation> {
    return this.http.patch<Reservation>(`${this.apiUrl}/reservations/${id}/status`, { status });
  }

  cancelReservation(id: number): Observable<Reservation> {
    return this.http.patch<Reservation>(`${this.apiUrl}/reservations/${id}/cancel`, {});
  }
}
