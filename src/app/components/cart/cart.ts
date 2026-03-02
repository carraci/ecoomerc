import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page-banner">
      <div class="container">
        <h1>Shopping Cart</h1>
        <div class="breadcrumb">
          <a routerLink="/">Home</a>
          <span>›</span>
          <span>Cart</span>
        </div>
      </div>
    </div>

    <div class="cart-page container">
      <div class="cart-layout" *ngIf="cartService.count() > 0; else emptyCart">
        <!-- Cart Items -->
        <div class="cart-items-section">
          <div class="cart-header">
            <h2>Your Cart ({{ cartService.count() }} items)</h2>
            <button id="clear-cart-btn" class="clear-cart-btn" (click)="cartService.clearCart()">Clear All</button>
          </div>

          <div class="cart-table">
            <div class="cart-head">
              <span>Product</span>
              <span>Price</span>
              <span>Quantity</span>
              <span>Subtotal</span>
              <span></span>
            </div>

            <div class="cart-row" *ngFor="let item of cartService.items()" [id]="'cart-row-' + item.product.id">
              <div class="cart-product">
                <img [src]="item.product.image" [alt]="item.product.name" />
                <div class="cart-product-info">
                  <span class="cp-brand">{{ item.product.brand }}</span>
                  <p class="cp-name">{{ item.product.name }}</p>
                  <span class="cp-category">{{ item.product.category }}</span>
                </div>
              </div>
              <div class="cart-price">\${{ item.product.price.toFixed(2) }}</div>
              <div class="cart-qty">
                <div class="qty-ctrl">
                  <button [id]="'qty-dec-' + item.product.id" (click)="cartService.updateQuantity(item.product.id, item.quantity - 1)">−</button>
                  <span>{{ item.quantity }}</span>
                  <button [id]="'qty-inc-' + item.product.id" (click)="cartService.updateQuantity(item.product.id, item.quantity + 1)">+</button>
                </div>
              </div>
              <div class="cart-subtotal">\${{ (item.product.price * item.quantity).toFixed(2) }}</div>
              <button class="remove-btn" [id]="'remove-' + item.product.id" (click)="cartService.removeFromCart(item.product.id)">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
              </button>
            </div>
          </div>

          <!-- Coupon -->
          <div class="coupon-section">
            <input type="text" id="coupon-input" placeholder="Enter coupon code..." [(ngModel)]="couponCode" />
            <button id="apply-coupon-btn" class="apply-btn" (click)="applyCoupon()">Apply Coupon</button>
            <a routerLink="/shop" id="continue-shopping-btn" class="continue-btn">← Continue Shopping</a>
          </div>
        </div>

        <!-- Order Summary -->
        <div class="order-summary">
          <h3>Order Summary</h3>
          <div class="summary-rows">
            <div class="summary-row">
              <span>Subtotal</span>
              <span>\${{ cartService.total().toFixed(2) }}</span>
            </div>
            <div class="summary-row">
              <span>Shipping</span>
              <span class="free-text">{{ cartService.total() > 99 ? 'FREE' : '$9.99' }}</span>
            </div>
            <div class="summary-row" *ngIf="discount > 0">
              <span>Discount</span>
              <span class="discount-text">-\${{ discount.toFixed(2) }}</span>
            </div>
            <div class="summary-row">
              <span>Tax (8%)</span>
              <span>\${{ (cartService.total() * 0.08).toFixed(2) }}</span>
            </div>
            <div class="summary-divider"></div>
            <div class="summary-row total-row">
              <strong>Total</strong>
              <strong class="total-val">\${{ getTotal().toFixed(2) }}</strong>
            </div>
          </div>

          <div class="shipping-note" *ngIf="cartService.total() < 99">
            <p>Add <strong>\${{ (99 - cartService.total()).toFixed(2) }}</strong> more for free shipping!</p>
            <div class="shipping-bar">
              <div [style.width]="(cartService.total() / 99 * 100) + '%'" class="shipping-fill"></div>
            </div>
          </div>

          <button id="checkout-btn" class="checkout-btn" (click)="goToCheckout()">
            🔒 Proceed to Checkout
          </button>

          <div class="payment-icons">
            <span class="pi-title">Accepted Payments:</span>
            <div class="pi-list">
              <span>💳 Visa</span>
              <span>💲 Mastercard</span>
              <span>📱 Apple Pay</span>
              <span>🅿️ PayPal</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty Cart -->
      <ng-template #emptyCart>
        <div class="empty-cart">
          <div class="empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any products yet.</p>
          <a routerLink="/shop" id="start-shopping-btn" class="start-shopping-btn">Start Shopping →</a>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .page-banner {
      background: linear-gradient(135deg, #119EAE, #0d6e7e);
      padding: 40px 0;
      color: #fff;
    }
    .page-banner h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
    .breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 13px; opacity: 0.85; }
    .breadcrumb a { color: #fff; }

    .cart-page { padding: 40px 15px 60px; }
    .cart-layout { display: grid; grid-template-columns: 1fr 340px; gap: 30px; }

    .cart-items-section {}
    .cart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .cart-header h2 { font-size: 20px; font-weight: 700; }
    .clear-cart-btn {
      background: transparent;
      border: 1px solid #e74c3c;
      color: #e74c3c;
      padding: 7px 16px;
      border-radius: 6px;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.3s;
    }
    .clear-cart-btn:hover { background: #e74c3c; color: #fff; }

    .cart-table { border: 1px solid #f0f0f0; border-radius: 12px; overflow: hidden; }
    .cart-head {
      display: grid;
      grid-template-columns: 3fr 1fr 1.5fr 1fr 40px;
      padding: 14px 20px;
      background: #f8f9fa;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #777;
    }
    .cart-row {
      display: grid;
      grid-template-columns: 3fr 1fr 1.5fr 1fr 40px;
      padding: 16px 20px;
      border-top: 1px solid #f5f5f5;
      align-items: center;
      transition: background 0.2s;
    }
    .cart-row:hover { background: #fafafa; }
    .cart-product { display: flex; gap: 12px; align-items: center; }
    .cart-product img { width: 70px; height: 70px; object-fit: contain; background: #f9f9f9; border-radius: 8px; padding: 6px; }
    .cp-brand { font-size: 11px; color: #119EAE; font-weight: 600; display: block; }
    .cp-name { font-size: 13px; font-weight: 600; color: #1a1a2e; margin: 3px 0; line-height: 1.3; }
    .cp-category { font-size: 11px; color: #bbb; }
    .cart-price { font-size: 14px; color: #555; }
    .qty-ctrl {
      display: flex;
      align-items: center;
      gap: 0;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      overflow: hidden;
      width: fit-content;
    }
    .qty-ctrl button {
      width: 32px;
      height: 32px;
      background: #f5f5f5;
      border: none;
      cursor: pointer;
      font-size: 16px;
      transition: background 0.2s;
    }
    .qty-ctrl button:hover { background: #119EAE; color: #fff; }
    .qty-ctrl span { padding: 0 12px; font-size: 14px; font-weight: 600; }
    .cart-subtotal { font-size: 15px; font-weight: 700; color: #119EAE; }
    .remove-btn {
      background: none;
      border: none;
      color: #ccc;
      cursor: pointer;
      padding: 6px;
      border-radius: 6px;
      transition: all 0.2s;
    }
    .remove-btn:hover { background: #fee; color: #e74c3c; }

    .coupon-section {
      display: flex;
      gap: 10px;
      margin-top: 20px;
      align-items: center;
      flex-wrap: wrap;
    }
    .coupon-section input {
      border: 1px solid #e9ecef;
      padding: 11px 16px;
      border-radius: 8px;
      font-size: 14px;
      width: 200px;
    }
    .apply-btn {
      background: #119EAE;
      color: #fff;
      border: none;
      padding: 11px 20px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
    }
    .continue-btn {
      color: #119EAE;
      font-size: 13px;
      font-weight: 600;
      text-decoration: none;
      margin-left: auto;
    }

    /* Order Summary */
    .order-summary {
      background: #fff;
      border-radius: 12px;
      border: 1px solid #f0f0f0;
      padding: 24px;
      height: fit-content;
      position: sticky;
      top: 80px;
    }
    .order-summary h3 { font-size: 18px; font-weight: 700; margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid #f0f0f0; }
    .summary-rows { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
    .summary-row {
      display: flex;
      justify-content: space-between;
      font-size: 14px;
      color: #555;
    }
    .free-text { color: #27ae60; font-weight: 700; }
    .discount-text { color: #e74c3c; font-weight: 700; }
    .summary-divider { border-top: 1px dashed #e9ecef; margin: 5px 0; }
    .total-row { font-size: 16px !important; }
    .total-val { color: #119EAE; font-size: 20px !important; }
    .shipping-note {
      background: #e8f7f9;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 15px;
    }
    .shipping-note p { font-size: 13px; color: #555; margin-bottom: 8px; }
    .shipping-bar { background: #d0e8ec; border-radius: 4px; height: 6px; overflow: hidden; }
    .shipping-fill { height: 100%; background: #119EAE; border-radius: 4px; transition: width 0.3s; }
    .checkout-btn {
      width: 100%;
      background: linear-gradient(135deg, #119EAE, #0d849a);
      color: #fff;
      border: none;
      padding: 15px;
      border-radius: 10px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s;
      margin-bottom: 18px;
    }
    .checkout-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(17,158,174,0.3); }
    .payment-icons { text-align: center; }
    .pi-title { font-size: 11px; color: #aaa; display: block; margin-bottom: 6px; }
    .pi-list { display: flex; justify-content: center; gap: 12px; font-size: 12px; color: #777; flex-wrap: wrap; }

    /* Empty Cart */
    .empty-cart {
      text-align: center;
      padding: 100px 20px;
    }
    .empty-icon { font-size: 70px; margin-bottom: 20px; opacity: 0.5; }
    .empty-cart h2 { font-size: 26px; color: #1a1a2e; margin-bottom: 10px; }
    .empty-cart p { color: #888; margin-bottom: 30px; font-size: 15px; }
    .start-shopping-btn {
      background: #119EAE;
      color: #fff;
      padding: 14px 32px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 15px;
      text-decoration: none;
      display: inline-block;
      transition: all 0.3s;
    }
    .start-shopping-btn:hover { background: #0d849a; transform: translateY(-2px); }

    @media (max-width: 1024px) {
      .cart-layout { grid-template-columns: 1fr; }
    }
    @media (max-width: 768px) {
      .cart-head, .cart-row { grid-template-columns: 2fr 1fr 1fr 40px; }
      .cart-head span:nth-child(2), .cart-row .cart-price { display: none; }
    }
  `]
})
export class CartComponent {
  cartService = inject(CartService);
  router = inject(Router);
  couponCode = '';
  discount = 0;

  goToCheckout() {
    this.router.navigate(['/checkout']);
  }

  applyCoupon() {
    if (this.couponCode.toUpperCase() === 'ELECTSHOP10') {
      this.discount = this.cartService.total() * 0.1;
    }
  }

  getTotal(): number {
    const shipping = this.cartService.total() > 99 ? 0 : 9.99;
    const tax = this.cartService.total() * 0.08;
    return this.cartService.total() + shipping + tax - this.discount;
  }
}
