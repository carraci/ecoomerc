import { Injectable, signal, computed } from '@angular/core';

export interface AuthUser {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
    private _user = signal<AuthUser | null>(null);
    private _token = signal<string | null>(null);

    readonly user = this._user.asReadonly();
    readonly token = this._token.asReadonly();
    readonly isLoggedIn = computed(() => this._user() !== null);
    readonly displayName = computed(() => {
        const u = this._user();
        return u ? `${u.firstName} ${u.lastName}`.trim() : '';
    });
    readonly initials = computed(() => {
        const u = this._user();
        if (!u) return '';
        return `${u.firstName[0] ?? ''}${u.lastName[0] ?? ''}`.toUpperCase();
    });

    /** Called after successful API login/register */
    login(user: AuthUser, token?: string) {
        this._user.set(user);
        if (token) this._token.set(token);
        localStorage.setItem('electshop_user', JSON.stringify(user));
        if (token) localStorage.setItem('electshop_token', token);
    }

    logout() {
        this._user.set(null);
        this._token.set(null);
        localStorage.removeItem('electshop_user');
        localStorage.removeItem('electshop_token');
    }

    restoreSession() {
        const raw = localStorage.getItem('electshop_user');
        const token = localStorage.getItem('electshop_token');
        if (raw) {
            try {
                this._user.set(JSON.parse(raw));
                if (token) this._token.set(token);
            } catch { }
        }
    }
}
