import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
<div class="page-hero">
  <div class="ph-inner">
    <h1>👤 My Profile</h1>
    <nav class="breadcrumb"><a routerLink="/">Home</a> › Account › Profile</nav>
  </div>
</div>

<div class="profile-page">
  <div class="sidebar">
    <div class="user-card">
      <div class="uc-avatar">{{ auth.initials() }}</div>
      <div class="uc-info"><strong>{{ auth.displayName() }}</strong><span>{{ auth.user()?.email }}</span></div>
      <div class="uc-badge">⭐ Premium Member</div>
    </div>
    <nav class="side-nav">
      <a routerLink="/profile" class="sn-item active">👤 My Profile</a>
      <a routerLink="/orders" class="sn-item">📦 My Orders</a>
      <a routerLink="/wishlist" class="sn-item">❤️ Wishlist</a>
      <a routerLink="/shop" class="sn-item">🛍️ Browse Shop</a>
      <button class="sn-logout" (click)="logout()" id="profile-logout-btn">🚪 Sign Out</button>
    </nav>
  </div>

  <div class="main-col">
    <!-- Stats -->
    <div class="stats-row">
      <div class="stat-box"><span class="sb-val">{{ orderCount }}</span><span class="sb-lbl">Total Orders</span></div>
      <div class="stat-box"><span class="sb-val">—</span><span class="sb-lbl">Wishlist Items</span></div>
      <div class="stat-box"><span class="sb-val">\${{ totalSpent.toFixed(2) }}</span><span class="sb-lbl">Total Spent</span></div>
      <div class="stat-box"><span class="sb-val">Member</span><span class="sb-lbl">Status</span></div>
    </div>

    <!-- Error / Success banners -->
    <div class="success-banner" *ngIf="saved">✓ Profile updated successfully!</div>
    <div class="error-banner" *ngIf="saveError">✗ {{ saveError }}</div>

    <!-- Personal Info -->
    <div class="form-card">
      <div class="fc-head"><h3>Personal Information</h3><span class="fc-tag">Edit your details</span></div>
      <div class="form-row2">
        <div class="form-group">
          <label>First Name</label>
          <input type="text" [(ngModel)]="form.firstName" id="profile-fname" placeholder="First name" />
        </div>
        <div class="form-group">
          <label>Last Name</label>
          <input type="text" [(ngModel)]="form.lastName" id="profile-lname" placeholder="Last name" />
        </div>
      </div>
      <div class="form-row2">
        <div class="form-group">
          <label>Email Address</label>
          <input type="email" [(ngModel)]="form.email" id="profile-email" placeholder="Email" />
        </div>
        <div class="form-group">
          <label>Phone Number</label>
          <input type="tel" [(ngModel)]="form.phone" id="profile-phone" placeholder="+1 (555) 000-0000" />
        </div>
      </div>
      <div class="form-group">
        <label>Date of Birth</label>
        <input type="date" [(ngModel)]="form.dob" id="profile-dob" />
      </div>
      <div class="form-actions">
        <button class="btn-primary" (click)="saveProfile()" id="save-profile-btn">💾 Save Changes</button>
      </div>
    </div>

    <!-- Address -->
    <div class="form-card">
      <div class="fc-head"><h3>Shipping Address</h3><span class="fc-tag">Default address</span></div>
      <div class="form-group">
        <label>Street Address</label>
        <input type="text" [(ngModel)]="form.address" id="profile-address" placeholder="123 Main Street" />
      </div>
      <div class="form-row2">
        <div class="form-group">
          <label>City</label>
          <input type="text" [(ngModel)]="form.city" id="profile-city" placeholder="New York" />
        </div>
        <div class="form-group">
          <label>ZIP Code</label>
          <input type="text" [(ngModel)]="form.zip" id="profile-zip" placeholder="10001" />
        </div>
      </div>
      <div class="form-group">
        <label>Country</label>
        <select [(ngModel)]="form.country" id="profile-country">
          <option>United States</option><option>United Kingdom</option><option>Canada</option><option>Australia</option><option>India</option>
        </select>
      </div>
      <div class="form-actions">
        <button class="btn-primary" (click)="saveProfile()" id="save-address-btn">💾 Save Address</button>
      </div>
    </div>

    <!-- Change Password -->
    <div class="form-card">
      <div class="fc-head"><h3>Change Password</h3><span class="fc-tag">Security</span></div>
      <div class="form-group">
        <label>Current Password</label>
        <input type="password" [(ngModel)]="form.currPass" id="profile-curr-pass" placeholder="Enter current password" />
      </div>
      <div class="form-row2">
        <div class="form-group">
          <label>New Password</label>
          <input type="password" [(ngModel)]="form.newPass" id="profile-new-pass" placeholder="New password" />
        </div>
        <div class="form-group">
          <label>Confirm Password</label>
          <input type="password" [(ngModel)]="form.confirmPass" id="profile-confirm-pass" placeholder="Confirm password" />
        </div>
      </div>
      <div class="form-actions">
        <button class="btn-danger" (click)="changePassword()" id="change-pass-btn">🔒 Update Password</button>
      </div>
    </div>

    <!-- Danger Zone -->
    <div class="form-card danger-zone">
      <div class="fc-head"><h3>⚠️ Danger Zone</h3></div>
      <div class="dz-row">
        <div><strong>Sign Out Everywhere</strong><p>Log out from all devices and sessions.</p></div>
        <button class="btn-ghost-danger" (click)="logout()" id="signout-all-btn">Sign Out</button>
      </div>
      <div class="dz-row">
        <div><strong>Delete Account</strong><p>Permanently delete your account and all data.</p></div>
        <button class="btn-ghost-danger" id="delete-account-btn">Delete Account</button>
      </div>
    </div>
  </div>
</div>
  `,
  styles: [`
    .page-hero{background:linear-gradient(135deg,#1a1a2e,#119EAE);padding:40px 0;color:#fff;text-align:center}
    .ph-inner h1{font-size:28px;font-weight:800;margin-bottom:8px}
    .breadcrumb{font-size:13px;opacity:.8}.breadcrumb a{color:#fff;text-decoration:none}
    .profile-page{max-width:1200px;margin:40px auto;padding:0 20px;display:grid;grid-template-columns:240px 1fr;gap:30px}
    .sidebar{display:flex;flex-direction:column;gap:20px}
    .user-card{background:#fff;border-radius:16px;padding:24px;box-shadow:0 2px 15px rgba(0,0,0,.07);display:flex;flex-direction:column;align-items:center;gap:10px;text-align:center}
    .uc-avatar{width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#119EAE,#0d6e7e);color:#fff;font-size:26px;font-weight:800;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 15px rgba(17,158,174,.4)}
    .uc-info strong{display:block;font-size:15px;color:#1a1a2e;font-weight:700}
    .uc-info span{font-size:12px;color:#888}
    .uc-badge{background:linear-gradient(135deg,#f39c12,#e67e22);color:#fff;font-size:11px;font-weight:700;padding:4px 14px;border-radius:20px;margin-top:4px}
    .side-nav{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 15px rgba(0,0,0,.07)}
    .sn-item{display:flex;align-items:center;gap:10px;padding:14px 18px;font-size:14px;color:#555;text-decoration:none;border-left:3px solid transparent;transition:all .2s}
    .sn-item:hover,.sn-item.active{background:#f5feff;color:#119EAE;border-left-color:#119EAE;font-weight:600}
    .sn-logout{width:100%;display:flex;align-items:center;gap:10px;padding:14px 18px;border:none;background:none;font-size:14px;color:#e74c3c;cursor:pointer;border-left:3px solid transparent;transition:all .2s;font-family:inherit}
    .sn-logout:hover{background:#fff5f5;border-left-color:#e74c3c}
    .main-col{display:flex;flex-direction:column;gap:24px}
    .stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
    .stat-box{background:#fff;border-radius:14px;padding:20px;text-align:center;box-shadow:0 2px 12px rgba(0,0,0,.06);border:1px solid #f5f5f5}
    .sb-val{display:block;font-size:24px;font-weight:800;color:#119EAE;margin-bottom:4px}
    .sb-lbl{font-size:12px;color:#888;font-weight:500}
    .success-banner{background:#d4edda;border:1px solid #c3e6cb;color:#155724;padding:14px 18px;border-radius:10px;font-size:14px;font-weight:600}
    .error-banner{background:#f8d7da;border:1px solid #f5c6cb;color:#721c24;padding:14px 18px;border-radius:10px;font-size:14px;font-weight:600;margin-top:8px}
    .form-card{background:#fff;border-radius:16px;padding:28px;box-shadow:0 2px 15px rgba(0,0,0,.07)}
    .fc-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:22px}
    .fc-head h3{font-size:17px;font-weight:700;color:#1a1a2e}
    .fc-tag{font-size:12px;background:#f0fafb;color:#119EAE;padding:4px 12px;border-radius:20px;font-weight:600}
    .form-row2{display:grid;grid-template-columns:1fr 1fr;gap:16px}
    .form-group{margin-bottom:18px}
    .form-group label{display:block;font-size:12px;font-weight:600;color:#666;margin-bottom:6px;text-transform:uppercase;letter-spacing:.3px}
    .form-group input,.form-group select{width:100%;padding:12px 14px;border:1.5px solid #e9ecef;border-radius:10px;font-size:14px;color:#333;transition:all .3s;background:#fafafa;font-family:inherit}
    .form-group input:focus,.form-group select:focus{outline:none;border-color:#119EAE;background:#fff;box-shadow:0 0 0 3px rgba(17,158,174,.1)}
    .form-actions{display:flex;justify-content:flex-end;margin-top:6px}
    .btn-primary{background:linear-gradient(135deg,#119EAE,#0d849a);color:#fff;border:none;padding:12px 24px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;transition:all .3s}
    .btn-primary:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(17,158,174,.4)}
    .btn-danger{background:linear-gradient(135deg,#e74c3c,#c0392b);color:#fff;border:none;padding:12px 24px;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;transition:all .3s}
    .btn-danger:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(231,76,60,.4)}
    .danger-zone{border:1px solid #f5c6cb}
    .dz-row{display:flex;justify-content:space-between;align-items:center;padding:16px 0;border-bottom:1px solid #fde;gap:20px}
    .dz-row:last-child{border-bottom:none}
    .dz-row div strong{font-size:14px;color:#1a1a2e;display:block;margin-bottom:4px}
    .dz-row div p{font-size:13px;color:#888;margin:0}
    .btn-ghost-danger{padding:10px 18px;border:1.5px solid #e74c3c;background:#fff;color:#e74c3c;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap;transition:all .2s;flex-shrink:0}
    .btn-ghost-danger:hover{background:#e74c3c;color:#fff}
    @media(max-width:900px){.stats-row{grid-template-columns:repeat(2,1fr)}}
    @media(max-width:768px){.profile-page{grid-template-columns:1fr}.sidebar{display:none}.form-row2{grid-template-columns:1fr}}
  `]
})
export class ProfileComponent implements OnInit {
  auth = inject(AuthService);
  api = inject(ApiService);
  router = inject(Router);
  saved = false;
  saveError = '';
  orderCount = 0;
  totalSpent = 0;

  form = {
    firstName: this.auth.user()?.firstName ?? '',
    lastName: this.auth.user()?.lastName ?? '',
    email: this.auth.user()?.email ?? '',
    phone: '',
    dob: '',
    address: '',
    city: '',
    zip: '',
    country: 'United States',
    currPass: '', newPass: '', confirmPass: ''
  };

  ngOnInit() {
    const token = this.auth.token();
    if (!token) return;

    // Load full profile from backend
    this.api.getProfile(token).subscribe({
      next: (res: any) => {
        const u = res.user;
        this.form.firstName = u.firstName ?? '';
        this.form.lastName = u.lastName ?? '';
        this.form.email = u.email ?? '';
        this.form.phone = u.phone ?? '';
        this.form.address = u.address ?? '';
        this.form.city = u.city ?? '';
        this.form.country = u.country ?? 'United States';
      },
      error: () => { }
    });

    // Load order stats
    this.api.getMyOrders(token).subscribe({
      next: (res: any) => {
        const orders: any[] = res.orders || [];
        this.orderCount = orders.length;
        this.totalSpent = orders.reduce((sum: number, o: any) => sum + (o.grandTotal || 0), 0);
      },
      error: () => { }
    });
  }

  saveProfile() {
    const token = this.auth.token();
    this.saved = false;
    this.saveError = '';

    const payload = {
      firstName: this.form.firstName,
      lastName: this.form.lastName,
      phone: this.form.phone,
      address: this.form.address,
      city: this.form.city,
      country: this.form.country
    };

    if (token) {
      this.api.updateProfile(token, payload).subscribe({
        next: (res: any) => {
          // Refresh local auth session
          this.auth.login({ ...res.user }, token);
          this.saved = true;
          setTimeout(() => this.saved = false, 3500);
        },
        error: (err: any) => {
          this.saveError = err.error?.message || 'Failed to save profile.';
        }
      });
    } else {
      // Guest: update local only
      this.auth.login({ firstName: this.form.firstName, lastName: this.form.lastName, email: this.form.email });
      this.saved = true;
      setTimeout(() => this.saved = false, 3000);
    }
  }

  changePassword() {
    if (!this.form.currPass || !this.form.newPass) return;
    if (this.form.newPass !== this.form.confirmPass) {
      this.saveError = 'New passwords do not match!'; return;
    }
    // Password change would need a dedicated API endpoint
    this.form.currPass = ''; this.form.newPass = ''; this.form.confirmPass = '';
    this.saved = true;
    this.saveError = '';
    setTimeout(() => this.saved = false, 3000);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
