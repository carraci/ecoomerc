import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';

interface Order {
  id: string; date: string; status: string; statusCls: string;
  items: { name: string; qty: number; price: number; img: string }[];
  total: number; tracking?: string;
}

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
<div class="page-hero">
  <div class="ph-inner">
    <h1>📦 My Orders</h1>
    <nav class="breadcrumb"><a routerLink="/">Home</a> › <a routerLink="/profile">Account</a> › Orders</nav>
  </div>
</div>

<div class="orders-page">

  <div class="sidebar">
    <div class="user-card">
      <div class="uc-avatar">{{ auth.initials() }}</div>
      <div class="uc-info">
        <strong>{{ auth.displayName() }}</strong>
        <span>{{ auth.user()?.email }}</span>
      </div>
    </div>
    <nav class="side-nav">
      <a routerLink="/profile" class="sn-item">👤 My Profile</a>
      <a routerLink="/orders" class="sn-item active">📦 My Orders</a>
      <a routerLink="/wishlist" class="sn-item">❤️ Wishlist</a>
      <a routerLink="/shop" class="sn-item">🛍️ Browse Shop</a>
    </nav>
  </div>

  <div class="main-col">
    <div class="section-header">
      <h2>Order History</h2>
      <span class="count">{{ orders.length }} orders</span>
    </div>

    <!-- Loading -->
    <div class="loading-state" *ngIf="loading">
      <div class="spinner"></div>
      <p>Loading your orders from MongoDB Atlas...</p>
    </div>

    <!-- Error -->
    <div class="error-state" *ngIf="error && !loading">
      <div style="font-size:48px;margin-bottom:12px">⚠️</div>
      <p>{{ error }}</p>
      <a routerLink="/auth" class="btn-primary" *ngIf="error.includes('log in')">Sign In</a>
    </div>

    <div class="order-card" *ngFor="let o of orders">
      <div class="oc-head">
        <div>
          <div class="oc-id">Order #{{ o.id }}</div>
          <div class="oc-date">Placed on {{ o.date }}</div>
        </div>
        <div class="right-col">
          <span class="status-badge" [class]="o.statusCls">{{ o.status }}</span>
          <span class="oc-total">\${{ o.total.toFixed(2) }}</span>
        </div>
      </div>
      <div class="oc-items">
        <div class="oc-item" *ngFor="let item of o.items">
          <div class="oi-img">{{ item.img }}</div>
          <div class="oi-info">
            <div class="oi-name">{{ item.name }}</div>
            <div class="oi-meta">Qty: {{ item.qty }} • \${{ item.price.toFixed(2) }} each</div>
          </div>
          <div class="oi-sub">\${{ (item.qty * item.price).toFixed(2) }}</div>
        </div>
      </div>
      <div class="oc-foot">
        <div class="tracking" *ngIf="o.tracking">🚚 Tracking: <strong>{{ o.tracking }}</strong></div>
        <div class="oc-actions">
          <button class="btn-ghost">View Details</button>
          <button class="btn-ghost" *ngIf="o.statusCls==='delivered'">Reorder</button>
          <button class="btn-ghost danger" *ngIf="o.statusCls==='processing'">Cancel</button>
        </div>
      </div>
    </div>

    <div class="empty-state" *ngIf="orders.length===0">
      <div class="es-icon">📦</div>
      <h3>No orders yet</h3>
      <p>Start shopping and your orders will appear here.</p>
      <a routerLink="/shop" class="btn-primary">Browse Products</a>
    </div>
  </div>
</div>
  `,
  styles: [`
    .page-hero{background:linear-gradient(135deg,#119EAE,#0d849a);padding:40px 0;color:#fff;text-align:center}
    .ph-inner h1{font-size:28px;font-weight:800;margin-bottom:8px}
    .breadcrumb{font-size:13px;opacity:.8}.breadcrumb a{color:#fff;text-decoration:none}
    .orders-page{max-width:1200px;margin:40px auto;padding:0 20px;display:grid;grid-template-columns:240px 1fr;gap:30px}
    .sidebar{display:flex;flex-direction:column;gap:20px}
    .user-card{background:#fff;border-radius:16px;padding:20px;box-shadow:0 2px 15px rgba(0,0,0,.07);display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center}
    .uc-avatar{width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#119EAE,#0d6e7e);color:#fff;font-size:22px;font-weight:800;display:flex;align-items:center;justify-content:center}
    .uc-info strong{display:block;font-size:15px;color:#1a1a2e;font-weight:700}
    .uc-info span{font-size:12px;color:#888}
    .side-nav{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 15px rgba(0,0,0,.07)}
    .sn-item{display:flex;align-items:center;gap:10px;padding:14px 18px;font-size:14px;color:#555;text-decoration:none;border-left:3px solid transparent;transition:all .2s}
    .sn-item:hover{background:#f5feff;color:#119EAE;border-left-color:#119EAE}
    .sn-item.active{background:#f0fafb;color:#119EAE;border-left-color:#119EAE;font-weight:600}
    .main-col{display:flex;flex-direction:column;gap:20px}
    .section-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}
    .section-header h2{font-size:20px;font-weight:700;color:#1a1a2e}
    .count{font-size:13px;background:#f0fafb;color:#119EAE;font-weight:600;padding:4px 12px;border-radius:20px}
    .order-card{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 15px rgba(0,0,0,.07);border:1px solid #f0f0f0}
    .oc-head{display:flex;justify-content:space-between;align-items:flex-start;padding:18px 20px;background:#fafafa;border-bottom:1px solid #f0f0f0}
    .oc-id{font-size:14px;font-weight:700;color:#1a1a2e}
    .oc-date{font-size:12px;color:#888;margin-top:3px}
    .right-col{display:flex;align-items:center;gap:14px}
    .status-badge{padding:5px 12px;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px}
    .processing{background:#fff3cd;color:#856404}
    .shipped{background:#cce5ff;color:#004085}
    .delivered{background:#d4edda;color:#155724}
    .cancelled{background:#f8d7da;color:#721c24}
    .oc-total{font-size:16px;font-weight:800;color:#1a1a2e}
    .oc-items{padding:16px 20px;display:flex;flex-direction:column;gap:12px}
    .oc-item{display:flex;align-items:center;gap:14px;padding:10px;background:#f9f9f9;border-radius:10px}
    .oi-img{width:48px;height:48px;border-radius:8px;background:#eee;font-size:24px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
    .oi-info{flex:1}
    .oi-name{font-size:14px;font-weight:600;color:#1a1a2e}
    .oi-meta{font-size:12px;color:#888;margin-top:2px}
    .oi-sub{font-size:14px;font-weight:700;color:#119EAE;flex-shrink:0}
    .oc-foot{display:flex;justify-content:space-between;align-items:center;padding:14px 20px;border-top:1px solid #f5f5f5}
    .tracking{font-size:13px;color:#555}
    .oc-actions{display:flex;gap:10px}
    .btn-ghost{padding:8px 16px;border:1.5px solid #e0e0e0;background:#fff;border-radius:8px;font-size:13px;font-weight:600;color:#555;cursor:pointer;transition:all .2s}
    .btn-ghost:hover{border-color:#119EAE;color:#119EAE}
    .btn-ghost.danger:hover{border-color:#e74c3c;color:#e74c3c}
    .empty-state{text-align:center;padding:60px 20px;background:#fff;border-radius:16px}
    .es-icon{font-size:64px;margin-bottom:16px}
    .empty-state h3{font-size:20px;font-weight:700;margin-bottom:8px;color:#1a1a2e}
    .empty-state p{font-size:14px;color:#888;margin-bottom:24px}
    .btn-primary{background:linear-gradient(135deg,#119EAE,#0d849a);color:#fff;padding:12px 28px;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;display:inline-block;transition:all .3s}
    .btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 25px rgba(17,158,174,.35)}
    @media(max-width:768px){.orders-page{grid-template-columns:1fr}.sidebar{display:none}}
    .loading-state{text-align:center;padding:60px;background:#fff;border-radius:16px}
    .error-state{text-align:center;padding:60px;background:#fff;border-radius:16px;color:#555}
    .spinner{width:44px;height:44px;border:4px solid #e0f5f7;border-top-color:#119EAE;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 16px}
    @keyframes spin{to{transform:rotate(360deg)}}
  `]
})
export class OrdersComponent implements OnInit {
  auth = inject(AuthService);
  api = inject(ApiService);
  orders: Order[] = [];
  loading = true;
  error = '';

  ngOnInit() {
    const token = this.auth.token();
    if (!token) {
      this.loading = false;
      this.error = 'Please log in to view your orders.';
      return;
    }
    this.api.getMyOrders(token).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.orders = (res.orders || []).map((o: any) => ({
          id: o.orderId,
          date: new Date(o.placedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          status: o.status.charAt(0).toUpperCase() + o.status.slice(1),
          statusCls: o.status,
          tracking: o.trackingNumber || '',
          items: (o.items || []).map((i: any) => ({
            name: i.name,
            qty: i.quantity,
            price: i.price,
            img: i.image || '📦'
          })),
          total: o.grandTotal
        }));
      },
      error: () => {
        this.loading = false;
        this.error = 'Failed to load orders. Please try again later.';
      }
    });
  }
}
