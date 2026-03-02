import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';

type Step = 'shipping' | 'payment' | 'confirm';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
<!-- Hero -->
<div class="ck-hero">
  <div class="ck-hero-inner">
    <a routerLink="/" class="ck-brand">
      <svg width="28" height="28" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="white" fill-opacity=".2"/><path d="M8 10h16M8 16h10M8 22h16" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg>
      Elect<strong>shop</strong>
    </a>
    <div class="ck-steps">
      <div class="ck-step" [class.active]="step==='shipping'" [class.done]="isDone('shipping')">
        <div class="ck-step-num">{{ isDone('shipping') ? '✓' : '1' }}</div>
        <span>Shipping</span>
      </div>
      <div class="ck-step-line"></div>
      <div class="ck-step" [class.active]="step==='payment'" [class.done]="isDone('payment')">
        <div class="ck-step-num">{{ isDone('payment') ? '✓' : '2' }}</div>
        <span>Payment</span>
      </div>
      <div class="ck-step-line"></div>
      <div class="ck-step" [class.active]="step==='confirm'">
        <div class="ck-step-num">3</div>
        <span>Confirm</span>
      </div>
    </div>
  </div>
</div>

<!-- Order placed screen -->
<div class="order-success" *ngIf="orderPlaced">
  <div class="os-card">
    <div class="os-icon">🎉</div>
    <h2>Order Placed Successfully!</h2>
    <p>Thank you, <strong>{{ sh.firstName }}</strong>! Your order <strong>#{{ orderId }}</strong> has been confirmed.</p>
    <div class="os-info">
      <div class="osi-row"><span>📧 Confirmation sent to</span><strong>{{ sh.email }}</strong></div>
      <div class="osi-row"><span>🚚 Estimated delivery</span><strong>3–5 Business Days</strong></div>
      <div class="osi-row"><span>💰 Total charged</span><strong>\${{ savedTotal.toFixed(2) }}</strong></div>
    </div>
    <div class="os-actions">
      <a routerLink="/orders" class="btn-primary">📦 Track My Order</a>
      <a routerLink="/shop" class="btn-outline">🛍️ Continue Shopping</a>
    </div>
  </div>
</div>

<!-- Main checkout layout -->
<div class="ck-layout" *ngIf="!orderPlaced">
  <div class="ck-main">

    <!-- ===== STEP 1: SHIPPING ===== -->
    <div class="ck-section" *ngIf="step==='shipping'">
      <div class="section-title"><span class="step-badge">1</span> Shipping Information</div>

      <div class="form-row2">
        <div class="fg" [class.err]="errors.firstName">
          <label>First Name *</label>
          <input type="text" [(ngModel)]="sh.firstName" id="sh-fname" placeholder="John" (blur)="validate()" />
          <span class="err-msg" *ngIf="errors.firstName">Required</span>
        </div>
        <div class="fg" [class.err]="errors.lastName">
          <label>Last Name *</label>
          <input type="text" [(ngModel)]="sh.lastName" id="sh-lname" placeholder="Doe" (blur)="validate()" />
          <span class="err-msg" *ngIf="errors.lastName">Required</span>
        </div>
      </div>
      <div class="form-row2">
        <div class="fg" [class.err]="errors.email">
          <label>Email Address *</label>
          <input type="email" [(ngModel)]="sh.email" id="sh-email" placeholder="you@example.com" (blur)="validate()" />
          <span class="err-msg" *ngIf="errors.email">Valid email required</span>
        </div>
        <div class="fg">
          <label>Phone Number</label>
          <input type="tel" [(ngModel)]="sh.phone" id="sh-phone" placeholder="+1 555 000 0000" />
        </div>
      </div>
      <div class="fg" [class.err]="errors.address">
        <label>Street Address *</label>
        <input type="text" [(ngModel)]="sh.address" id="sh-address" placeholder="123 Main Street, Apt 4B" (blur)="validate()" />
        <span class="err-msg" *ngIf="errors.address">Required</span>
      </div>
      <div class="form-row3">
        <div class="fg" [class.err]="errors.city">
          <label>City *</label>
          <input type="text" [(ngModel)]="sh.city" id="sh-city" placeholder="New York" (blur)="validate()" />
          <span class="err-msg" *ngIf="errors.city">Required</span>
        </div>
        <div class="fg">
          <label>State</label>
          <input type="text" [(ngModel)]="sh.state" id="sh-state" placeholder="NY" />
        </div>
        <div class="fg" [class.err]="errors.zip">
          <label>ZIP Code *</label>
          <input type="text" [(ngModel)]="sh.zip" id="sh-zip" placeholder="10001" (blur)="validate()" />
          <span class="err-msg" *ngIf="errors.zip">Required</span>
        </div>
      </div>
      <div class="fg">
        <label>Country</label>
        <select [(ngModel)]="sh.country" id="sh-country">
          <option>United States</option><option>United Kingdom</option><option>Canada</option><option>Australia</option><option>India</option>
        </select>
      </div>

      <!-- Shipping method -->
      <div class="section-title" style="margin-top:28px"><span class="step-badge">📦</span> Shipping Method</div>
      <div class="ship-options">
        <label class="ship-opt" [class.sel]="sh.shipping==='standard'" (click)="sh.shipping='standard'">
          <div class="so-radio" [class.on]="sh.shipping==='standard'"></div>
          <div class="so-info">
            <strong>Standard Shipping</strong>
            <span>5–7 business days</span>
          </div>
          <div class="so-price">{{ subtotal() > 99 ? 'FREE' : '$9.99' }}</div>
        </label>
        <label class="ship-opt" [class.sel]="sh.shipping==='express'" (click)="sh.shipping='express'">
          <div class="so-radio" [class.on]="sh.shipping==='express'"></div>
          <div class="so-info">
            <strong>Express Shipping</strong>
            <span>2–3 business days</span>
          </div>
          <div class="so-price">\$19.99</div>
        </label>
        <label class="ship-opt" [class.sel]="sh.shipping==='overnight'" (click)="sh.shipping='overnight'">
          <div class="so-radio" [class.on]="sh.shipping==='overnight'"></div>
          <div class="so-info">
            <strong>Overnight Delivery</strong>
            <span>Next business day</span>
          </div>
          <div class="so-price">\$39.99</div>
        </label>
      </div>

      <button class="btn-next" id="btn-next-shipping" (click)="goToPayment()">
        Continue to Payment →
      </button>
    </div>

    <!-- ===== STEP 2: PAYMENT ===== -->
    <div class="ck-section" *ngIf="step==='payment'">
      <button class="back-btn" (click)="step='shipping'">← Back to Shipping</button>
      <div class="section-title"><span class="step-badge">2</span> Payment Method</div>

      <div class="pay-tabs">
        <button class="pay-tab" [class.active]="pm==='card'" (click)="pm='card'" id="tab-card">💳 Credit / Debit Card</button>
        <button class="pay-tab" [class.active]="pm==='paypal'" (click)="pm='paypal'" id="tab-paypal">🅿️ PayPal</button>
        <button class="pay-tab" [class.active]="pm==='applepay'" (click)="pm='applepay'" id="tab-applepay">📱 Apple Pay</button>
        <button class="pay-tab" [class.active]="pm==='cod'" (click)="pm='cod'" id="tab-cod">💵 Cash on Delivery</button>
      </div>

      <!-- Credit Card -->
      <div class="pay-form" *ngIf="pm==='card'">
        <div class="card-preview">
          <div class="cp-chip">▤</div>
          <div class="cp-num">{{ formatCardNum(pay.cardNum) }}</div>
          <div class="cp-row">
            <div><div class="cp-lbl">Card Holder</div><div class="cp-val">{{ pay.cardName || 'YOUR NAME' }}</div></div>
            <div><div class="cp-lbl">Expires</div><div class="cp-val">{{ pay.expiry || 'MM/YY' }}</div></div>
          </div>
        </div>
        <div class="fg" [class.err]="errors.cardName">
          <label>Cardholder Name *</label>
          <input type="text" [(ngModel)]="pay.cardName" id="pay-cardname" placeholder="John Doe" (blur)="validate()" />
          <span class="err-msg" *ngIf="errors.cardName">Required</span>
        </div>
        <div class="fg" [class.err]="errors.cardNum">
          <label>Card Number *</label>
          <input type="text" [(ngModel)]="pay.cardNum" id="pay-cardnum" placeholder="1234 5678 9012 3456" maxlength="19" (input)="fmtCard()" (blur)="validate()" />
          <span class="err-msg" *ngIf="errors.cardNum">Valid card number required</span>
        </div>
        <div class="form-row2">
          <div class="fg" [class.err]="errors.expiry">
            <label>Expiry Date *</label>
            <input type="text" [(ngModel)]="pay.expiry" id="pay-expiry" placeholder="MM/YY" maxlength="5" (blur)="validate()" />
            <span class="err-msg" *ngIf="errors.expiry">Required</span>
          </div>
          <div class="fg" [class.err]="errors.cvv">
            <label>CVV *</label>
            <input type="password" [(ngModel)]="pay.cvv" id="pay-cvv" placeholder="•••" maxlength="4" (blur)="validate()" />
            <span class="err-msg" *ngIf="errors.cvv">Required</span>
          </div>
        </div>
        <label class="save-card">
          <input type="checkbox" [(ngModel)]="pay.saveCard" id="save-card" />
          <span>Save this card for future purchases</span>
        </label>
      </div>

      <!-- PayPal -->
      <div class="alt-pay-box" *ngIf="pm==='paypal'">
        <div class="alt-icon">🅿️</div>
        <p>You'll be redirected to PayPal to complete your payment securely.</p>
        <div class="alt-badge">🔒 Secured by PayPal</div>
      </div>

      <!-- Apple Pay -->
      <div class="alt-pay-box" *ngIf="pm==='applepay'">
        <div class="alt-icon">📱</div>
        <p>Authenticate with Face ID or Touch ID to pay with Apple Pay.</p>
        <div class="alt-badge">🔒 Secured by Apple</div>
      </div>

      <!-- Cash on Delivery -->
      <div class="alt-pay-box" *ngIf="pm==='cod'">
        <div class="alt-icon">💵</div>
        <p>Pay in cash when your order is delivered to your door. Additional fee of <strong>$2.00</strong> applies.</p>
        <div class="alt-badge">No online payment needed</div>
      </div>

      <button class="btn-next" id="btn-review-order" (click)="goToConfirm()">
        Review Order →
      </button>
    </div>

    <!-- ===== STEP 3: CONFIRM ===== -->
    <div class="ck-section" *ngIf="step==='confirm'">
      <button class="back-btn" (click)="step='payment'">← Back to Payment</button>
      <div class="section-title"><span class="step-badge">3</span> Review & Place Order</div>

      <!-- Shipping summary -->
      <div class="review-block">
        <div class="rb-head"><span>📦 Shipping to</span><button class="rb-edit" (click)="step='shipping'">Edit</button></div>
        <div class="rb-body">
          <strong>{{ sh.firstName }} {{ sh.lastName }}</strong><br>
          {{ sh.address }}, {{ sh.city }} {{ sh.zip }}<br>
          {{ sh.country }}<br>
          {{ sh.phone }}
        </div>
      </div>

      <!-- Payment summary -->
      <div class="review-block">
        <div class="rb-head"><span>💳 Payment</span><button class="rb-edit" (click)="step='payment'">Edit</button></div>
        <div class="rb-body">
          <span *ngIf="pm==='card'">Credit/Debit Card ending in ••••{{ pay.cardNum.slice(-4) || '----' }}</span>
          <span *ngIf="pm==='paypal'">PayPal</span>
          <span *ngIf="pm==='applepay'">Apple Pay</span>
          <span *ngIf="pm==='cod'">Cash on Delivery</span>
        </div>
      </div>

      <!-- Items -->
      <div class="review-block">
        <div class="rb-head"><span>🛒 Items ({{ cart.count() }})</span><a routerLink="/cart" class="rb-edit">Edit Cart</a></div>
        <div class="order-items">
          <div class="oi-row" *ngFor="let item of cart.items()">
            <img [src]="item.product.image" [alt]="item.product.name" />
            <div class="oi-info">
              <div class="oi-name">{{ item.product.name }}</div>
              <div class="oi-meta">{{ item.product.brand }} · Qty: {{ item.quantity }}</div>
            </div>
            <div class="oi-price">\${{ (item.product.price * item.quantity).toFixed(2) }}</div>
          </div>
        </div>
      </div>

      <button class="btn-place" id="btn-place-order" (click)="placeOrder()" [disabled]="placing">
        <span class="spin" *ngIf="placing"></span>
        🔒 {{ placing ? 'Placing Order...' : 'Place Order — $' + grandTotal().toFixed(2) }}
      </button>
      <p class="tos-note">By placing this order you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.</p>
    </div>

  </div>

  <!-- RIGHT: Order Summary sidebar -->
  <div class="ck-sidebar">
    <div class="ck-summary">
      <div class="cs-head" (click)="showItems=!showItems">
        <span>🛒 Order Summary ({{ cart.count() }} items)</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
          [style.transform]="showItems?'rotate(180deg)':'rotate(0)'" style="transition:.3s">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </div>

      <div class="cs-items" *ngIf="showItems">
        <div class="cs-item" *ngFor="let item of cart.items()">
          <div class="csi-img">
            <img [src]="item.product.image" [alt]="item.product.name" />
            <span class="csi-qty">{{ item.quantity }}</span>
          </div>
          <div class="csi-info">
            <div class="csi-name">{{ item.product.name }}</div>
            <div class="csi-brand">{{ item.product.brand }}</div>
          </div>
          <div class="csi-price">\${{ (item.product.price * item.quantity).toFixed(2) }}</div>
        </div>
      </div>

      <div class="cs-coupon">
        <input type="text" [(ngModel)]="coupon" id="ck-coupon" placeholder="Coupon code" />
        <button (click)="applyCoupon()" id="ck-apply-coupon">Apply</button>
      </div>
      <div class="coupon-ok" *ngIf="discount>0">✓ Coupon applied — saved \${{ discount.toFixed(2) }}!</div>

      <div class="cs-rows">
        <div class="cs-row"><span>Subtotal</span><span>\${{ subtotal().toFixed(2) }}</span></div>
        <div class="cs-row"><span>Shipping</span><span [class.free]="shippingCost()===0">{{ shippingCost()===0 ? 'FREE' : '$' + shippingCost().toFixed(2) }}</span></div>
        <div class="cs-row discount" *ngIf="discount>0"><span>Discount</span><span>−\${{ discount.toFixed(2) }}</span></div>
        <div class="cs-row"><span>Tax (8%)</span><span>\${{ tax().toFixed(2) }}</span></div>
        <div class="cs-divider"></div>
        <div class="cs-row total"><strong>Total</strong><strong class="total-val">\${{ grandTotal().toFixed(2) }}</strong></div>
      </div>

      <div class="cs-trust">
        <span>🔒 SSL Encrypted</span>
        <span>🛡️ Safe Checkout</span>
        <span>↩️ 30-Day Returns</span>
      </div>
    </div>
  </div>
</div>
  `,
  styles: [`
    * { box-sizing: border-box; }

    /* Hero */
    .ck-hero { background: linear-gradient(135deg, #1a1a2e, #119EAE); padding: 18px 40px; }
    .ck-hero-inner { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
    .ck-brand { display: flex; align-items: center; gap: 10px; font-size: 20px; font-weight: 300; color: #fff; text-decoration: none; }
    .ck-brand strong { font-weight: 800; color: #5ee; }
    .ck-steps { display: flex; align-items: center; gap: 0; }
    .ck-step { display: flex; align-items: center; gap: 8px; font-size: 13px; color: rgba(255,255,255,.5); font-weight: 600; }
    .ck-step.active { color: #fff; }
    .ck-step.done { color: #5ee; }
    .ck-step-num { width: 28px; height: 28px; border-radius: 50%; background: rgba(255,255,255,.15); display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; border: 2px solid rgba(255,255,255,.2); }
    .ck-step.active .ck-step-num { background: #119EAE; border-color: #119EAE; color: #fff; }
    .ck-step.done .ck-step-num { background: #27ae60; border-color: #27ae60; color: #fff; }
    .ck-step-line { width: 40px; height: 2px; background: rgba(255,255,255,.2); margin: 0 8px; }

    /* Layout */
    .ck-layout { max-width: 1100px; margin: 40px auto; padding: 0 20px 60px; display: grid; grid-template-columns: 1fr 360px; gap: 30px; }

    /* Section */
    .ck-section { background: #fff; border-radius: 16px; padding: 30px; box-shadow: 0 2px 20px rgba(0,0,0,.07); }
    .section-title { display: flex; align-items: center; gap: 10px; font-size: 17px; font-weight: 700; color: #1a1a2e; margin-bottom: 22px; }
    .step-badge { width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg, #119EAE, #0d849a); color: #fff; font-size: 13px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .back-btn { background: none; border: none; color: #119EAE; font-size: 13px; font-weight: 600; cursor: pointer; margin-bottom: 20px; padding: 0; }

    /* Forms */
    .form-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .form-row3 { display: grid; grid-template-columns: 1fr 80px 120px; gap: 16px; }
    .fg { margin-bottom: 18px; }
    .fg label { display: block; font-size: 12px; font-weight: 600; color: #666; margin-bottom: 6px; text-transform: uppercase; letter-spacing: .3px; }
    .fg input, .fg select { width: 100%; padding: 12px 14px; border: 1.5px solid #e9ecef; border-radius: 10px; font-size: 14px; color: #333; transition: all .3s; background: #fafafa; font-family: inherit; }
    .fg input:focus, .fg select:focus { outline: none; border-color: #119EAE; background: #fff; box-shadow: 0 0 0 3px rgba(17,158,174,.1); }
    .fg.err input { border-color: #e74c3c; }
    .err-msg { font-size: 11px; color: #e74c3c; margin-top: 4px; display: block; }

    /* Shipping options */
    .ship-options { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
    .ship-opt { display: flex; align-items: center; gap: 14px; padding: 14px 18px; border: 1.5px solid #e9ecef; border-radius: 12px; cursor: pointer; transition: all .3s; }
    .ship-opt.sel { border-color: #119EAE; background: #f0fafb; }
    .ship-opt:hover { border-color: #119EAE; }
    .so-radio { width: 18px; height: 18px; border-radius: 50%; border: 2px solid #ccc; flex-shrink: 0; transition: all .3s; }
    .so-radio.on { border-color: #119EAE; background: #119EAE; box-shadow: inset 0 0 0 3px #fff; }
    .so-info { flex: 1; }
    .so-info strong { display: block; font-size: 14px; font-weight: 700; color: #1a1a2e; }
    .so-info span { font-size: 12px; color: #888; }
    .so-price { font-size: 14px; font-weight: 700; color: #119EAE; }

    /* Payment tabs */
    .pay-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 24px; }
    .pay-tab { padding: 10px 16px; border: 1.5px solid #e9ecef; border-radius: 10px; background: #fafafa; font-size: 13px; font-weight: 600; cursor: pointer; transition: all .3s; color: #555; }
    .pay-tab.active { border-color: #119EAE; background: #f0fafb; color: #119EAE; }

    /* Card preview */
    .card-preview { background: linear-gradient(135deg, #1a1a2e, #119EAE); border-radius: 14px; padding: 22px 24px 20px; color: #fff; margin-bottom: 24px; min-height: 130px; position: relative; overflow: hidden; }
    .card-preview::before { content: ''; position: absolute; top: -30px; right: -30px; width: 130px; height: 130px; border-radius: 50%; background: rgba(255,255,255,.07); }
    .cp-chip { font-size: 22px; margin-bottom: 16px; opacity: .8; }
    .cp-num { font-size: 17px; letter-spacing: 3px; font-weight: 600; margin-bottom: 16px; font-family: monospace; }
    .cp-row { display: flex; justify-content: space-between; }
    .cp-lbl { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; opacity: .6; margin-bottom: 3px; }
    .cp-val { font-size: 13px; font-weight: 600; text-transform: uppercase; }

    /* Alt pay */
    .alt-pay-box { text-align: center; padding: 40px 20px; background: #f8f9fa; border-radius: 14px; margin-bottom: 20px; }
    .alt-icon { font-size: 56px; margin-bottom: 12px; }
    .alt-pay-box p { font-size: 14px; color: #666; line-height: 1.7; margin-bottom: 14px; }
    .alt-badge { display: inline-block; background: #e8f7f9; color: #119EAE; font-size: 12px; font-weight: 700; padding: 6px 14px; border-radius: 20px; }

    /* Save card checkbox */
    .save-card { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #666; cursor: pointer; margin-bottom: 20px; }

    /* Review blocks */
    .review-block { border: 1px solid #f0f0f0; border-radius: 12px; margin-bottom: 16px; overflow: hidden; }
    .rb-head { display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; background: #fafafa; font-size: 14px; font-weight: 700; color: #1a1a2e; }
    .rb-edit { background: none; border: none; color: #119EAE; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; }
    .rb-body { padding: 14px 18px; font-size: 13px; color: #555; line-height: 1.8; }

    .order-items { padding: 12px 18px; display: flex; flex-direction: column; gap: 10px; }
    .oi-row { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid #f5f5f5; }
    .oi-row:last-child { border-bottom: none; }
    .oi-row img { width: 48px; height: 48px; object-fit: contain; background: #f9f9f9; border-radius: 8px; padding: 4px; }
    .oi-info { flex: 1; }
    .oi-name { font-size: 13px; font-weight: 600; color: #1a1a2e; }
    .oi-meta { font-size: 11px; color: #888; margin-top: 2px; }
    .oi-price { font-size: 14px; font-weight: 700; color: #119EAE; flex-shrink: 0; }

    /* Buttons */
    .btn-next { width: 100%; background: linear-gradient(135deg, #119EAE, #0d849a); color: #fff; border: none; padding: 16px; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; transition: all .3s; margin-top: 8px; }
    .btn-next:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(17,158,174,.4); }
    .btn-place { width: 100%; background: linear-gradient(135deg, #27ae60, #1e8449); color: #fff; border: none; padding: 18px; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; transition: all .3s; display: flex; align-items: center; justify-content: center; gap: 10px; }
    .btn-place:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(39,174,96,.4); }
    .btn-place:disabled { opacity: .7; cursor: not-allowed; }
    .tos-note { text-align: center; font-size: 12px; color: #aaa; margin-top: 12px; }
    .tos-note a { color: #119EAE; }
    .spin { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,.4); border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Sidebar */
    .ck-sidebar { position: sticky; top: 20px; height: fit-content; }
    .ck-summary { background: #fff; border-radius: 16px; padding: 24px; box-shadow: 0 2px 20px rgba(0,0,0,.07); }
    .cs-head { display: flex; justify-content: space-between; align-items: center; font-size: 15px; font-weight: 700; color: #1a1a2e; margin-bottom: 16px; cursor: pointer; }
    .cs-items { margin-bottom: 18px; border: 1px solid #f5f5f5; border-radius: 10px; padding: 12px; }
    .cs-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f9f9f9; }
    .cs-item:last-child { border-bottom: none; }
    .csi-img { position: relative; flex-shrink: 0; }
    .csi-img img { width: 44px; height: 44px; object-fit: contain; background: #f5f5f5; border-radius: 8px; padding: 4px; }
    .csi-qty { position: absolute; top: -6px; right: -6px; min-width: 18px; height: 18px; background: #119EAE; color: #fff; border-radius: 50%; font-size: 10px; font-weight: 800; display: flex; align-items: center; justify-content: center; }
    .csi-info { flex: 1; }
    .csi-name { font-size: 12px; font-weight: 600; color: #1a1a2e; line-height: 1.3; }
    .csi-brand { font-size: 11px; color: #888; margin-top: 1px; }
    .csi-price { font-size: 13px; font-weight: 700; color: #119EAE; flex-shrink: 0; }
    .cs-coupon { display: flex; gap: 8px; margin-bottom: 10px; }
    .cs-coupon input { flex: 1; padding: 10px 12px; border: 1.5px solid #e9ecef; border-radius: 8px; font-size: 13px; }
    .cs-coupon input:focus { outline: none; border-color: #119EAE; }
    .cs-coupon button { padding: 10px 14px; background: #119EAE; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; }
    .coupon-ok { font-size: 12px; color: #27ae60; font-weight: 600; margin-bottom: 14px; }
    .cs-rows { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
    .cs-row { display: flex; justify-content: space-between; font-size: 14px; color: #555; }
    .cs-row .free { color: #27ae60; font-weight: 700; }
    .cs-row.discount { color: #e74c3c; }
    .cs-divider { height: 1px; background: #f0f0f0; margin: 4px 0; }
    .cs-row.total { font-size: 16px; }
    .total-val { color: #119EAE; font-size: 20px !important; }
    .cs-trust { display: flex; flex-wrap: wrap; gap: 8px; border-top: 1px solid #f5f5f5; padding-top: 14px; }
    .cs-trust span { font-size: 11px; color: #888; font-weight: 600; }

    /* Order Success */
    .order-success { min-height: 80vh; display: flex; align-items: center; justify-content: center; padding: 40px 20px; }
    .os-card { max-width: 520px; width: 100%; background: #fff; border-radius: 24px; padding: 48px; text-align: center; box-shadow: 0 10px 50px rgba(0,0,0,.1); }
    .os-icon { font-size: 72px; margin-bottom: 16px; animation: bounce .8s ease infinite alternate; }
    @keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-10px); } }
    .os-card h2 { font-size: 26px; font-weight: 800; color: #1a1a2e; margin-bottom: 10px; }
    .os-card>p { font-size: 15px; color: #666; margin-bottom: 24px; line-height: 1.7; }
    .os-info { background: #f8fffe; border: 1px solid #e0f5f7; border-radius: 14px; padding: 18px; margin-bottom: 28px; text-align: left; }
    .osi-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-bottom: 1px solid #eef; font-size: 13px; }
    .osi-row:last-child { border-bottom: none; }
    .osi-row span { color: #666; }
    .osi-row strong { color: #1a1a2e; font-weight: 700; }
    .os-actions { display: flex; flex-direction: column; gap: 10px; }
    .btn-primary { display: block; background: linear-gradient(135deg, #119EAE, #0d849a); color: #fff; padding: 15px 24px; border-radius: 12px; font-size: 15px; font-weight: 700; text-decoration: none; transition: all .3s; }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(17,158,174,.4); }
    .btn-outline { display: block; border: 1.5px solid #e9ecef; color: #555; padding: 13px 24px; border-radius: 12px; font-size: 14px; font-weight: 600; text-decoration: none; transition: all .2s; }
    .btn-outline:hover { border-color: #119EAE; color: #119EAE; }

    @media (max-width: 900px) { .ck-layout { grid-template-columns: 1fr; } .ck-sidebar { position: static; } .form-row2, .form-row3 { grid-template-columns: 1fr; } }
  `]
})
export class CheckoutComponent {
  cart = inject(CartService);
  auth = inject(AuthService);
  api = inject(ApiService);
  router = inject(Router);

  step: Step = 'shipping';
  pm = 'card';
  orderPlaced = false;
  placing = false;
  showItems = true;
  coupon = '';
  discount = 0;
  orderId = '';

  sh = {
    firstName: this.auth.user()?.firstName ?? '',
    lastName: this.auth.user()?.lastName ?? '',
    email: this.auth.user()?.email ?? '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'United States',
    shipping: 'standard'
  };

  pay = { cardName: '', cardNum: '', expiry: '', cvv: '', saveCard: false };
  errors: {
    firstName?: boolean; lastName?: boolean; email?: boolean;
    address?: boolean; city?: boolean; zip?: boolean;
    cardName?: boolean; cardNum?: boolean; expiry?: boolean; cvv?: boolean;
  } = {};

  subtotal() { return this.cart.total(); }
  shippingCost() {
    if (this.sh.shipping === 'express') return 19.99;
    if (this.sh.shipping === 'overnight') return 39.99;
    return this.subtotal() > 99 ? 0 : 9.99;
  }
  tax() { return (this.subtotal() - this.discount) * 0.08; }
  grandTotal() {
    return this.subtotal() + this.shippingCost() + this.tax() - this.discount + (this.pm === 'cod' ? 2 : 0);
  }

  isDone(s: Step) {
    const order = ['shipping', 'payment', 'confirm'];
    return order.indexOf(s) < order.indexOf(this.step);
  }

  validate(): boolean {
    this.errors = {};
    if (this.step === 'shipping' || this.step === 'confirm') {
      if (!this.sh.firstName) this.errors['firstName'] = true;
      if (!this.sh.lastName) this.errors['lastName'] = true;
      if (!this.sh.email || !/\S+@\S+\.\S+/.test(this.sh.email)) this.errors['email'] = true;
      if (!this.sh.address) this.errors['address'] = true;
      if (!this.sh.city) this.errors['city'] = true;
      if (!this.sh.zip) this.errors['zip'] = true;
    }
    if (this.step === 'payment' && this.pm === 'card') {
      if (!this.pay.cardName) this.errors['cardName'] = true;
      if (!this.pay.cardNum || this.pay.cardNum.replace(/\s/g, '').length < 15) this.errors['cardNum'] = true;
      if (!this.pay.expiry) this.errors['expiry'] = true;
      if (!this.pay.cvv) this.errors['cvv'] = true;
    }
    return Object.keys(this.errors).length === 0;
  }

  goToPayment() {
    this.step = 'shipping';
    if (this.validate()) this.step = 'payment';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goToConfirm() {
    this.step = 'payment';
    if (this.validate()) this.step = 'confirm';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  applyCoupon() {
    const code = this.coupon.toUpperCase();
    if (code === 'ELECTSHOP10') { this.discount = this.subtotal() * 0.1; }
    else if (code === 'SAVE20') { this.discount = this.subtotal() * 0.2; }
    else if (code === 'FREESHIP') { this.discount = this.shippingCost(); }
  }

  fmtCard() {
    let v = this.pay.cardNum.replace(/\D/g, '').substring(0, 16);
    this.pay.cardNum = v.replace(/(.{4})/g, '$1 ').trim();
  }

  formatCardNum(n: string) {
    const raw = n.replace(/\s/g, '');
    if (!raw) return '•••• •••• •••• ••••';
    return (raw + '•'.repeat(Math.max(0, 16 - raw.length))).replace(/(.{4})/g, '$1 ').trim();
  }

  savedTotal = 0;
  placeOrder() {
    if (!this.validate()) return;
    this.placing = true;

    const token = this.auth.token();
    const cartItems = this.cart.items();

    const payload = {
      items: cartItems.map(i => ({
        productId: String(i.product.id),
        name: i.product.name,
        brand: i.product.brand,
        image: i.product.image,
        price: i.product.price,
        quantity: i.quantity,
        subtotal: +(i.product.price * i.quantity).toFixed(2)
      })),
      shipping: {
        firstName: this.sh.firstName,
        lastName: this.sh.lastName,
        email: this.sh.email,
        phone: this.sh.phone,
        address: this.sh.address,
        city: this.sh.city,
        state: this.sh.state,
        zip: this.sh.zip,
        country: this.sh.country,
        method: this.sh.shipping
      },
      payment: {
        method: this.pm,
        cardLast4: this.pm === 'card' ? this.pay.cardNum.replace(/\s/g, '').slice(-4) : ''
      },
      subtotal: +this.subtotal().toFixed(2),
      shippingCost: +this.shippingCost().toFixed(2),
      tax: +this.tax().toFixed(2),
      discount: +this.discount.toFixed(2),
      grandTotal: +this.grandTotal().toFixed(2)
    };

    this.savedTotal = this.grandTotal();

    if (token) {
      // ─── Logged-in: save to MongoDB Atlas ───────────────────────────────
      this.api.placeOrder(token, payload).subscribe({
        next: (res) => {
          this.placing = false;
          this.orderId = res.orderId;
          this.orderPlaced = true;
          this.cart.clearCart();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        error: (err) => {
          this.placing = false;
          alert(err.error?.message || 'Failed to place order. Please try again.');
        }
      });
    } else {
      // ─── Guest: local only ──────────────────────────────────────────────
      this.orderId = 'ES-' + Date.now().toString().slice(-8);
      setTimeout(() => {
        this.placing = false;
        this.orderPlaced = true;
        this.cart.clearCart();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 1800);
    }
  }
}
