import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-wishlist',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
<div class="page-hero">
  <div class="ph-inner">
    <h1>❤️ My Wishlist</h1>
    <nav class="breadcrumb"><a routerLink="/">Home</a> › <a routerLink="/profile">Account</a> › Wishlist</nav>
  </div>
</div>

<div class="wl-page">
  <div class="sidebar">
    <div class="user-card">
      <div class="uc-avatar">{{ auth.initials() }}</div>
      <div class="uc-info"><strong>{{ auth.displayName() }}</strong><span>{{ auth.user()?.email }}</span></div>
    </div>
    <nav class="side-nav">
      <a routerLink="/profile" class="sn-item">👤 My Profile</a>
      <a routerLink="/orders" class="sn-item">📦 My Orders</a>
      <a routerLink="/wishlist" class="sn-item active">❤️ Wishlist</a>
      <a routerLink="/shop" class="sn-item">🛍️ Browse Shop</a>
    </nav>
  </div>

  <div class="main-col">
    <div class="section-header">
      <h2>Saved Items</h2>
      <span class="count">{{ items.length }} items</span>
    </div>

    <div class="wl-grid">
      <div class="wl-card" *ngFor="let item of items">
        <div class="wl-img">{{ item.emoji }}</div>
        <div class="wl-body">
          <div class="wl-brand">{{ item.brand }}</div>
          <div class="wl-name">{{ item.name }}</div>
          <div class="wl-price">
            <span class="price-now">\${{ item.price.toFixed(2) }}</span>
            <span class="price-old" *ngIf="item.oldPrice">\${{ item.oldPrice.toFixed(2) }}</span>
            <span class="discount" *ngIf="item.discount">-{{ item.discount }}%</span>
          </div>
          <div class="wl-stock" [class.instock]="item.inStock" [class.outstock]="!item.inStock">
            {{ item.inStock ? '✓ In Stock' : '✗ Out of Stock' }}
          </div>
        </div>
        <div class="wl-actions">
          <button class="btn-primary" [disabled]="!item.inStock" (click)="addToCart(item)">🛒 Add to Cart</button>
          <button class="btn-ghost" (click)="removeItem(item)">✕ Remove</button>
        </div>
      </div>
    </div>

    <div class="empty-state" *ngIf="items.length===0">
      <div class="es-icon">❤️</div>
      <h3>Your wishlist is empty</h3>
      <p>Save items you love and come back to them anytime.</p>
      <a routerLink="/shop" class="btn-primary">Start Shopping</a>
    </div>
  </div>
</div>
  `,
    styles: [`
    .page-hero{background:linear-gradient(135deg,#e74c3c,#c0392b);padding:40px 0;color:#fff;text-align:center}
    .ph-inner h1{font-size:28px;font-weight:800;margin-bottom:8px}
    .breadcrumb{font-size:13px;opacity:.8}.breadcrumb a{color:#fff;text-decoration:none}
    .wl-page{max-width:1200px;margin:40px auto;padding:0 20px;display:grid;grid-template-columns:240px 1fr;gap:30px}
    .sidebar{display:flex;flex-direction:column;gap:20px}
    .user-card{background:#fff;border-radius:16px;padding:20px;box-shadow:0 2px 15px rgba(0,0,0,.07);display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center}
    .uc-avatar{width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,#119EAE,#0d6e7e);color:#fff;font-size:22px;font-weight:800;display:flex;align-items:center;justify-content:center}
    .uc-info strong{display:block;font-size:15px;color:#1a1a2e;font-weight:700}
    .uc-info span{font-size:12px;color:#888}
    .side-nav{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 15px rgba(0,0,0,.07)}
    .sn-item{display:flex;align-items:center;gap:10px;padding:14px 18px;font-size:14px;color:#555;text-decoration:none;border-left:3px solid transparent;transition:all .2s}
    .sn-item:hover,.sn-item.active{background:#f5feff;color:#119EAE;border-left-color:#119EAE;font-weight:600}
    .main-col{display:flex;flex-direction:column;gap:20px}
    .section-header{display:flex;justify-content:space-between;align-items:center}
    .section-header h2{font-size:20px;font-weight:700;color:#1a1a2e}
    .count{font-size:13px;background:#fde8e8;color:#e74c3c;font-weight:600;padding:4px 12px;border-radius:20px}
    .wl-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px}
    .wl-card{background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 15px rgba(0,0,0,.08);border:1px solid #f5f5f5;display:flex;flex-direction:column;transition:transform .3s,box-shadow .3s}
    .wl-card:hover{transform:translateY(-4px);box-shadow:0 10px 30px rgba(0,0,0,.12)}
    .wl-img{background:#f8f9fa;height:160px;display:flex;align-items:center;justify-content:center;font-size:64px}
    .wl-body{padding:16px;flex:1}
    .wl-brand{font-size:11px;font-weight:700;color:#119EAE;text-transform:uppercase;letter-spacing:.5px;margin-bottom:4px}
    .wl-name{font-size:14px;font-weight:700;color:#1a1a2e;margin-bottom:10px}
    .wl-price{display:flex;align-items:center;gap:8px;margin-bottom:8px}
    .price-now{font-size:18px;font-weight:800;color:#119EAE}
    .price-old{font-size:13px;color:#bbb;text-decoration:line-through}
    .discount{background:#fff0f0;color:#e74c3c;font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px}
    .wl-stock{font-size:12px;font-weight:600}
    .instock{color:#27ae60}.outstock{color:#e74c3c}
    .wl-actions{padding:12px 16px;display:flex;flex-direction:column;gap:8px;border-top:1px solid #f5f5f5}
    .btn-primary{background:linear-gradient(135deg,#119EAE,#0d849a);color:#fff;border:none;padding:10px;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;transition:all .3s;width:100%}
    .btn-primary:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 5px 15px rgba(17,158,174,.35)}
    .btn-primary:disabled{opacity:.5;cursor:not-allowed}
    .btn-ghost{background:none;border:1.5px solid #f0f0f0;color:#888;border-radius:8px;padding:8px;font-size:12px;cursor:pointer;transition:all .2s;width:100%}
    .btn-ghost:hover{border-color:#e74c3c;color:#e74c3c}
    .empty-state{text-align:center;padding:60px 20px;background:#fff;border-radius:16px;grid-column:1/-1}
    .es-icon{font-size:64px;margin-bottom:16px}
    .empty-state h3{font-size:20px;font-weight:700;margin-bottom:8px;color:#1a1a2e}
    .empty-state p{font-size:14px;color:#888;margin-bottom:24px}
    a.btn-primary{display:inline-block;text-decoration:none}
    @media(max-width:768px){.wl-page{grid-template-columns:1fr}.sidebar{display:none}}
  `]
})
export class WishlistComponent {
    auth = inject(AuthService);

    items = [
        { id: 1, emoji: '📱', brand: 'Apple', name: 'iPhone 15 Pro Max 256GB', price: 1199.00, oldPrice: 1299.00, discount: 8, inStock: true },
        { id: 2, emoji: '🎧', brand: 'Sony', name: 'WH-1000XM5 Wireless Headphones', price: 279.00, oldPrice: 349.00, discount: 20, inStock: true },
        { id: 3, emoji: '💻', brand: 'Apple', name: 'MacBook Pro 14" M3 Pro', price: 1999.00, oldPrice: null, discount: 0, inStock: false },
        { id: 4, emoji: '⌚', brand: 'Samsung', name: 'Galaxy Watch 6 Classic 47mm', price: 349.00, oldPrice: 399.00, discount: 13, inStock: true },
    ];

    addToCart(item: any) {
        // Show toast
        const toast = document.createElement('div');
        toast.style.cssText = 'position:fixed;bottom:30px;right:30px;background:#119EAE;color:#fff;padding:14px 22px;border-radius:12px;font-size:14px;font-weight:600;z-index:9999;box-shadow:0 8px 25px rgba(17,158,174,.4);animation:slideIn .3s ease';
        toast.textContent = `✓ ${item.name} added to cart!`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    removeItem(item: any) {
        this.items = this.items.filter(i => i.id !== item.id);
    }
}
