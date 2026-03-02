import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../services/product.service';
import { CartService } from '../../services/cart.service';

@Component({
    selector: 'app-product-card',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
    <div class="product-card" [class.list-view]="listView">
      <div class="product-image-wrap">
        <!-- Badges -->
        <div class="badges">
          <span *ngIf="product.badge === 'new'" class="badge badge-new">NEW</span>
          <span *ngIf="product.badge === 'hot'" class="badge badge-hot">HOT</span>
          <span *ngIf="product.badge === 'sale'" class="badge badge-sale">SALE</span>
          <span *ngIf="!product.inStock" class="badge badge-out">OUT OF STOCK</span>
        </div>

        <!-- Discount Badge -->
        <div class="discount-pct" *ngIf="product.discount > 0">-{{ product.discount }}%</div>

        <!-- Product Image -->
        <a [routerLink]="['/product', product.id]" [id]="'product-img-' + product.id">
          <img [src]="product.image" [alt]="product.name" loading="lazy" class="product-img" />
        </a>

        <!-- Hover Actions -->
        <div class="hover-actions">
          <button class="action-btn" [id]="'wishlist-' + product.id" title="Add to Wishlist">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </button>
          <button class="action-btn" [id]="'quickview-' + product.id" title="Quick View">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
          <button class="action-btn" [id]="'compare-' + product.id" title="Compare">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          </button>
        </div>

        <!-- Add to Cart Overlay -->
        <button class="add-cart-overlay" [id]="'cart-overlay-' + product.id"
          [disabled]="!product.inStock"
          (click)="addToCart()">
          🛒 ADD TO CART
        </button>
      </div>

      <div class="product-info">
        <p class="product-brand">{{ product.brand }}</p>
        <a [routerLink]="['/product', product.id]" [id]="'product-name-' + product.id" class="product-name">{{ product.name }}</a>

        <!-- Stars -->
        <div class="product-rating">
          <div class="stars">
            <span *ngFor="let star of getStars(product.rating)">{{ star }}</span>
          </div>
          <span class="review-count">({{ product.reviews }})</span>
        </div>

        <!-- Price -->
        <div class="product-price">
          <span class="price-now">\${{ product.price.toFixed(2) }}</span>
          <span class="price-was" *ngIf="product.oldPrice > product.price">\${{ product.oldPrice.toFixed(2) }}</span>
        </div>

        <!-- Add to Cart Button -->
        <button class="btn-add-cart" [id]="'add-cart-btn-' + product.id"
          [disabled]="!product.inStock"
          (click)="addToCart()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
          {{ product.inStock ? 'Add to Cart' : 'Out of Stock' }}
        </button>
      </div>

      <div class="added-toast" [class.show]="showToast">✓ Added to cart!</div>
    </div>
  `,
    styles: [`
    .product-card {
      background: #fff;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #f0f0f0;
      transition: all 0.3s ease;
      position: relative;
    }
    .product-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 40px rgba(17,158,174,0.15);
      border-color: #119EAE;
    }
    .product-image-wrap {
      position: relative;
      overflow: hidden;
      background: #f8f8f8;
      height: 220px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .product-img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 15px;
      transition: transform 0.4s ease;
    }
    .product-card:hover .product-img { transform: scale(1.06); }

    .badges {
      position: absolute;
      top: 10px;
      left: 10px;
      z-index: 2;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .badge {
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge-new { background: #119EAE; color: #fff; }
    .badge-hot { background: #f39c12; color: #fff; }
    .badge-sale { background: #e74c3c; color: #fff; }
    .badge-out { background: #2d2d2d; color: #fff; }
    .discount-pct {
      position: absolute;
      top: 10px;
      right: 10px;
      background: #e74c3c;
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 20px;
      z-index: 2;
    }

    /* Hover Actions */
    .hover-actions {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateX(60px) translateY(-50%);
      display: flex;
      flex-direction: column;
      gap: 6px;
      transition: transform 0.3s ease;
      z-index: 3;
    }
    .product-card:hover .hover-actions { transform: translateX(0) translateY(-50%); }
    .action-btn {
      width: 34px;
      height: 34px;
      background: #fff;
      border: 1px solid #eee;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.2s;
      color: #555;
    }
    .action-btn:hover { background: #119EAE; color: #fff; border-color: #119EAE; }
    .action-btn:hover svg { stroke: #fff; }

    /* Add to Cart Overlay */
    .add-cart-overlay {
      position: absolute;
      bottom: -50px;
      left: 0;
      right: 0;
      background: #119EAE;
      color: #fff;
      border: none;
      padding: 12px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 1px;
      cursor: pointer;
      transition: bottom 0.3s ease;
      z-index: 3;
    }
    .product-card:hover .add-cart-overlay { bottom: 0; }
    .add-cart-overlay:hover { background: #0d849a; }
    .add-cart-overlay:disabled { background: #aaa; cursor: not-allowed; }

    .product-info { padding: 15px; }
    .product-brand { font-size: 11px; color: #119EAE; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
    .product-name {
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: #1a1a2e;
      line-height: 1.4;
      margin-bottom: 8px;
      text-decoration: none;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      transition: color 0.2s;
    }
    .product-name:hover { color: #119EAE; }
    .product-rating { display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
    .stars { display: flex; gap: 1px; font-size: 13px; }
    .review-count { font-size: 11px; color: #999; }
    .product-price { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
    .price-now { font-size: 17px; font-weight: 700; color: #119EAE; }
    .price-was { font-size: 13px; color: #bbb; text-decoration: line-through; }

    .btn-add-cart {
      width: 100%;
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      color: #1a1a2e;
      padding: 9px 12px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      transition: all 0.3s;
    }
    .btn-add-cart:hover { background: #119EAE; color: #fff; border-color: #119EAE; }
    .btn-add-cart:hover svg { stroke: #fff; }
    .btn-add-cart:disabled { opacity: 0.5; cursor: not-allowed; }

    .added-toast {
      position: absolute;
      bottom: -60px;
      left: 50%;
      transform: translateX(-50%);
      background: #27ae60;
      color: #fff;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      transition: bottom 0.3s ease;
      white-space: nowrap;
      z-index: 10;
    }
    .added-toast.show { bottom: 50px; }
  `]
})
export class ProductCardComponent {
    @Input() product!: Product;
    @Input() listView = false;
    @Output() cartAdded = new EventEmitter<Product>();

    cartService = inject(CartService);
    showToast = false;

    getStars(rating: number): string[] {
        return Array.from({ length: 5 }, (_, i) => i < rating ? '⭐' : '☆');
    }

    addToCart() {
        if (!this.product.inStock) return;
        this.cartService.addToCart(this.product);
        this.cartAdded.emit(this.product);
        this.showToast = true;
        setTimeout(() => this.showToast = false, 2000);
    }
}
