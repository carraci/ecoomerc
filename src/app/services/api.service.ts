import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginPayload { email: string; password: string; }
export interface RegisterPayload { firstName: string; lastName: string; email: string; password: string; }
export interface AuthResponse { message: string; token: string; user: { id: string; firstName: string; lastName: string; email: string; }; }

export interface OrderItem {
    productId?: string;
    name: string;
    brand?: string;
    image?: string;
    price: number;
    quantity: number;
    subtotal: number;
}

export interface PlaceOrderPayload {
    items: OrderItem[];
    shipping: any;
    payment: { method: string; cardLast4?: string; };
    subtotal: number;
    shippingCost: number;
    tax: number;
    discount: number;
    grandTotal: number;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
    private http = inject(HttpClient);
    private base = environment.apiUrl;

    // ── helpers ──────────────────────────────────────────────────────────────────
    private headers(token: string): HttpHeaders {
        return new HttpHeaders({ Authorization: `Bearer ${token}` });
    }

    // ── Auth ─────────────────────────────────────────────────────────────────────
    login(payload: LoginPayload): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.base}/auth/login`, payload);
    }

    register(payload: RegisterPayload): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.base}/auth/register`, payload);
    }

    getProfile(token: string): Observable<any> {
        return this.http.get(`${this.base}/auth/profile`, { headers: this.headers(token) });
    }

    updateProfile(token: string, data: any): Observable<any> {
        return this.http.put(`${this.base}/auth/profile`, data, { headers: this.headers(token) });
    }

    // ── Orders ───────────────────────────────────────────────────────────────────
    placeOrder(token: string, payload: PlaceOrderPayload): Observable<any> {
        return this.http.post(`${this.base}/orders`, payload, { headers: this.headers(token) });
    }

    getMyOrders(token: string): Observable<any> {
        return this.http.get(`${this.base}/orders/my`, { headers: this.headers(token) });
    }

    getOrder(token: string, orderId: string): Observable<any> {
        return this.http.get(`${this.base}/orders/${orderId}`, { headers: this.headers(token) });
    }

    // ── Cart ─────────────────────────────────────────────────────────────────────
    getCart(token: string): Observable<any> {
        return this.http.get(`${this.base}/cart`, { headers: this.headers(token) });
    }

    saveCart(token: string, items: any[]): Observable<any> {
        return this.http.put(`${this.base}/cart`, { items }, { headers: this.headers(token) });
    }

    clearCart(token: string): Observable<any> {
        return this.http.delete(`${this.base}/cart`, { headers: this.headers(token) });
    }

    // ── Health ───────────────────────────────────────────────────────────────────
    health(): Observable<any> {
        return this.http.get(`${this.base}/health`);
    }
}
