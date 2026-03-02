import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService, Product } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { ProductCardComponent } from '../product-card/product-card';

@Component({
    selector: 'app-product-detail',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule, ProductCardComponent],
    template: `
    <ng-container *ngIf="product; else loading">

      <!-- Breadcrumb -->
      <div class="breadcrumb-bar">
        <div class="container breadcrumb-inner">
          <a routerLink="/">Home</a>
          <span class="sep">›</span>
          <a [routerLink]="['/shop']" [queryParams]="{category: product.category}">{{ product.category }}</a>
          <span class="sep">›</span>
          <span>{{ product.name }}</span>
        </div>
      </div>

      <!-- Main Product Section -->
      <section class="product-section">
        <div class="container product-layout">

          <!-- Image Gallery -->
          <div class="product-gallery">
            <div class="main-image-wrap">
              <span *ngIf="product.badge" class="gallery-badge" [class]="'badge-' + product.badge">
                {{ product.badge | uppercase }}
              </span>
              <span class="gallery-discount">-{{ product.discount }}%</span>
              <img [src]="product.image" [alt]="product.name" class="main-img" />
              <button class="zoom-btn" id="zoom-btn" title="Zoom">🔍</button>
            </div>
            <div class="thumb-row">
              <div class="thumb active" *ngFor="let n of [1,2,3,4]" [id]="'thumb-' + n">
                <img [src]="product.image" [alt]="'View ' + n" />
              </div>
            </div>
          </div>

          <!-- Product Info -->
          <div class="product-info">
            <div class="pi-brand">{{ product.brand }}</div>
            <h1 class="pi-title">{{ product.name }}</h1>

            <div class="pi-rating">
              <span class="stars">{{ '⭐'.repeat(product.rating) }}</span>
              <span class="review-cnt">({{ product.reviews }} reviews)</span>
              <span class="sep-dot">•</span>
              <span class="stock-badge" [class.out]="!product.inStock">
                {{ product.inStock ? '✓ In Stock' : '✗ Out of Stock' }}
              </span>
            </div>

            <div class="pi-price">
              <span class="price-main">\${{ product.price.toFixed(2) }}</span>
              <span class="price-old" *ngIf="product.oldPrice > product.price">\${{ product.oldPrice.toFixed(2) }}</span>
              <span class="price-save">Save \${{ (product.oldPrice - product.price).toFixed(2) }} ({{ product.discount }}% OFF)</span>
            </div>

            <p class="pi-desc">{{ product.description }}</p>

            <!-- Features -->
            <div class="pi-features">
              <h4>Key Features</h4>
              <ul>
                <li *ngFor="let f of product.features">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#119EAE" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  {{ f }}
                </li>
              </ul>
            </div>

            <!-- Colors -->
            <div class="pi-colors" *ngIf="product.colors?.length">
              <label>Color: <strong>{{ selectedColor }}</strong></label>
              <div class="color-swatches">
                <div *ngFor="let c of product.colors; let i = index"
                  class="swatch" [style.background]="c"
                  [class.active]="selectedColorIndex === i"
                  [id]="'color-' + i"
                  (click)="selectedColorIndex = i; selectedColor = colorLabels[i] || 'Color ' + (i+1)"
                  [title]="colorLabels[i] || 'Option ' + (i+1)">
                </div>
              </div>
            </div>

            <!-- Quantity + Actions -->
            <div class="pi-actions">
              <div class="qty-selector">
                <button (click)="decQty()" id="qty-dec">−</button>
                <input type="number" [(ngModel)]="qty" min="1" max="99" id="qty-input" />
                <button (click)="incQty()" id="qty-inc">+</button>
              </div>
              <button class="btn-add-cart" id="add-to-cart-btn"
                [disabled]="!product.inStock"
                (click)="addToCart()">
                🛒 Add to Cart
              </button>
              <button class="btn-wishlist" id="wishlist-btn" (click)="toggleWishlist()">
                {{ wishlisted ? '❤️' : '🤍' }}
              </button>
            </div>

            <!-- Success Toast -->
            <div class="cart-success" [class.show]="showSuccess">
              ✓ Added {{ qty }} item(s) to cart!
              <a routerLink="/cart">View Cart →</a>
            </div>

            <!-- Meta Info -->
            <div class="pi-meta">
              <div class="meta-row"><span>Category:</span><a [routerLink]="['/shop']" [queryParams]="{category: product.category}">{{ product.category }}</a></div>
              <div class="meta-row"><span>Brand:</span><strong>{{ product.brand }}</strong></div>
              <div class="meta-row"><span>SKU:</span><strong>ELEC-{{ product.id.toString().padStart(5, '0') }}</strong></div>
              <div class="meta-row"><span>Share:</span>
                <div class="share-btns">
                  <a href="#" id="share-fb">Facebook</a>
                  <a href="#" id="share-tw">Twitter</a>
                  <a href="#" id="share-wa">WhatsApp</a>
                </div>
              </div>
            </div>

            <!-- Trust Badges -->
            <div class="trust-badges">
              <div class="trust-item"><span>🚚</span> Free Shipping over $99</div>
              <div class="trust-item"><span>🔄</span> 30-Day Returns</div>
              <div class="trust-item"><span>🔒</span> Secure Payment</div>
              <div class="trust-item"><span>🎁</span> Gift Wrapping</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Tabs: Description / Reviews -->
      <section class="tabs-section">
        <div class="container">
          <div class="tabs-bar">
            <button [class.active]="activeTab === 'desc'" (click)="activeTab = 'desc'" id="tab-desc">Description</button>
            <button [class.active]="activeTab === 'reviews'" (click)="activeTab = 'reviews'" id="tab-reviews">Reviews ({{ product.reviews }})</button>
            <button [class.active]="activeTab === 'shipping'" (click)="activeTab = 'shipping'" id="tab-shipping">Shipping & Returns</button>
          </div>

          <div class="tab-body" *ngIf="activeTab === 'desc'">
            <h3>Product Description</h3>
            <p>{{ product.description }}</p>
            <p>Experience the very best in {{ product.category.toLowerCase() }} technology with the {{ product.name }} from {{ product.brand }}. Engineered for performance, designed for everyday life, this product brings together cutting-edge technology and premium build quality to give you an unparalleled experience.</p>
            <h4>Specifications</h4>
            <table class="spec-table">
              <tbody>
                <tr *ngFor="let f of product.features">
                  <td class="spec-key">{{ f.split(' ').slice(0,2).join(' ') }}</td>
                  <td>{{ f }}</td>
                </tr>
                <tr><td class="spec-key">Brand</td><td>{{ product.brand }}</td></tr>
                <tr><td class="spec-key">Category</td><td>{{ product.category }}</td></tr>
                <tr><td class="spec-key">Warranty</td><td>1 Year Manufacturer Warranty</td></tr>
                <tr><td class="spec-key">Availability</td><td>{{ product.inStock ? 'In Stock – Ships in 1–3 business days' : 'Out of Stock' }}</td></tr>
              </tbody>
            </table>
          </div>

          <div class="tab-body" *ngIf="activeTab === 'reviews'">
            <div class="review-summary">
              <div class="avg-score">
                <span class="big-score">{{ product.rating }}.0</span>
                <div class="big-stars">{{ '⭐'.repeat(product.rating) }}</div>
                <small>{{ product.reviews }} Reviews</small>
              </div>
              <div class="rating-bars">
                <div class="rbar" *ngFor="let r of [5,4,3,2,1]">
                  <span>{{ r }}⭐</span>
                  <div class="bar"><div class="fill" [style.width]="getRatingPct(r) + '%'"></div></div>
                  <span class="pct">{{ getRatingPct(r) }}%</span>
                </div>
              </div>
            </div>
            <div class="review-list">
              <div class="review-card" *ngFor="let rv of demoReviews" [id]="'review-' + rv.id">
                <div class="rv-top">
                  <div class="rv-avatar">{{ rv.name[0] }}</div>
                  <div>
                    <strong>{{ rv.name }}</strong>
                    <div class="rv-stars">{{ '⭐'.repeat(rv.stars) }}</div>
                  </div>
                  <span class="rv-date">{{ rv.date }}</span>
                </div>
                <p>{{ rv.text }}</p>
              </div>
            </div>
          </div>

          <div class="tab-body" *ngIf="activeTab === 'shipping'">
            <h3>Shipping Information</h3>
            <div class="shipping-info-grid">
              <div class="si-card">
                <span class="si-icon">🚚</span>
                <h4>Standard Delivery</h4>
                <p>3–7 Business Days</p>
                <p class="si-price">FREE over $99 | $9.99</p>
              </div>
              <div class="si-card">
                <span class="si-icon">⚡</span>
                <h4>Express Delivery</h4>
                <p>1–2 Business Days</p>
                <p class="si-price">$19.99</p>
              </div>
              <div class="si-card">
                <span class="si-icon">🔄</span>
                <h4>Easy Returns</h4>
                <p>30-Day Return Window</p>
                <p class="si-price">Free Returns</p>
              </div>
              <div class="si-card">
                <span class="si-icon">🔒</span>
                <h4>Secure Packaging</h4>
                <p>Tamper-proof packaging</p>
                <p class="si-price">Always Included</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Related Products -->
      <section class="related-section">
        <div class="container">
          <h2 class="section-title">Related Products</h2>
          <div class="related-grid" *ngIf="relatedProducts.length">
            <app-product-card *ngFor="let p of relatedProducts" [product]="p"></app-product-card>
          </div>
        </div>
      </section>

    </ng-container>

    <ng-template #loading>
      <div class="loading-screen">
        <div class="spinner"></div>
        <p>Loading product...</p>
      </div>
    </ng-template>
  `,
    styles: [`
    .breadcrumb-bar {
      background: #f8f9fa;
      border-bottom: 1px solid #eee;
      padding: 12px 0;
    }
    .breadcrumb-inner {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      flex-wrap: wrap;
    }
    .breadcrumb-inner a { color: #119EAE; }
    .breadcrumb-inner a:hover { text-decoration: underline; }
    .sep { color: #bbb; }

    .product-section { padding: 40px 0; }
    .product-layout {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 50px;
      align-items: start;
    }

    /* Gallery */
    .product-gallery {}
    .main-image-wrap {
      position: relative;
      background: #f8f9fa;
      border-radius: 16px;
      overflow: hidden;
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 15px;
      border: 1px solid #eeeeee;
    }
    .gallery-badge {
      position: absolute;
      top: 15px;
      left: 15px;
      padding: 4px 12px;
      border-radius: 5px;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1px;
      z-index: 2;
    }
    .badge-hot { background: #f39c12; color: #fff; }
    .badge-new { background: #119EAE; color: #fff; }
    .badge-sale { background: #e74c3c; color: #fff; }
    .gallery-discount {
      position: absolute;
      top: 15px;
      right: 15px;
      background: #e74c3c;
      color: #fff;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      z-index: 2;
    }
    .main-img {
      width: 80%;
      height: 80%;
      object-fit: contain;
      transition: transform 0.4s ease;
    }
    .main-image-wrap:hover .main-img { transform: scale(1.08); }
    .zoom-btn {
      position: absolute;
      bottom: 15px;
      right: 15px;
      background: rgba(255,255,255,0.9);
      border: none;
      border-radius: 8px;
      padding: 6px 10px;
      cursor: pointer;
      font-size: 16px;
    }
    .thumb-row { display: flex; gap: 10px; }
    .thumb {
      width: 70px;
      height: 70px;
      border-radius: 10px;
      border: 2px solid #eee;
      overflow: hidden;
      cursor: pointer;
      background: #f8f9fa;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: border-color 0.2s;
    }
    .thumb:hover, .thumb.active { border-color: #119EAE; }
    .thumb img { width: 100%; height: 100%; object-fit: contain; padding: 5px; }

    /* Product Info */
    .pi-brand {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #119EAE;
      margin-bottom: 8px;
    }
    .pi-title {
      font-size: 26px;
      font-weight: 800;
      color: #1a1a2e;
      line-height: 1.3;
      margin-bottom: 15px;
      font-family: 'Poppins', sans-serif;
    }
    .pi-rating {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .stars { font-size: 16px; }
    .review-cnt { color: #888; font-size: 13px; }
    .sep-dot { color: #ddd; }
    .stock-badge { font-size: 13px; font-weight: 600; color: #27ae60; }
    .stock-badge.out { color: #e74c3c; }

    .pi-price {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .price-main { font-size: 32px; font-weight: 800; color: #119EAE; font-family: 'Poppins', sans-serif; }
    .price-old { font-size: 18px; text-decoration: line-through; color: #bbb; }
    .price-save {
      background: #e8f7f9;
      color: #119EAE;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
    }
    .pi-desc { font-size: 15px; color: #555; line-height: 1.8; margin-bottom: 20px; }

    .pi-features { margin-bottom: 20px; }
    .pi-features h4 { font-size: 14px; font-weight: 700; margin-bottom: 10px; color: #1a1a2e; }
    .pi-features ul { list-style: none; display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
    .pi-features li {
      display: flex;
      align-items: center;
      gap: 7px;
      font-size: 13px;
      color: #444;
    }

    .pi-colors { margin-bottom: 20px; }
    .pi-colors label { font-size: 13px; font-weight: 600; color: #555; display: block; margin-bottom: 8px; }
    .color-swatches { display: flex; gap: 10px; }
    .swatch {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 3px solid #eee;
      cursor: pointer;
      transition: all 0.2s;
    }
    .swatch:hover, .swatch.active { border-color: #119EAE; transform: scale(1.15); }

    .pi-actions {
      display: flex;
      gap: 12px;
      align-items: center;
      margin-bottom: 15px;
      flex-wrap: wrap;
    }
    .qty-selector {
      display: flex;
      align-items: center;
      border: 1px solid #e9ecef;
      border-radius: 10px;
      overflow: hidden;
    }
    .qty-selector button {
      width: 40px;
      height: 48px;
      background: #f5f5f5;
      border: none;
      font-size: 20px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .qty-selector button:hover { background: #119EAE; color: #fff; }
    .qty-selector input {
      width: 55px;
      height: 48px;
      border: none;
      text-align: center;
      font-size: 16px;
      font-weight: 700;
    }
    .btn-add-cart {
      flex: 1;
      background: linear-gradient(135deg, #119EAE, #0d849a);
      color: #fff;
      border: none;
      padding: 14px 28px;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s;
      min-width: 160px;
    }
    .btn-add-cart:hover { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(17,158,174,0.3); }
    .btn-add-cart:disabled { background: #ccc; cursor: not-allowed; transform: none; box-shadow: none; }
    .btn-wishlist {
      width: 50px;
      height: 50px;
      border-radius: 10px;
      border: 1px solid #eee;
      background: #fff;
      font-size: 22px;
      cursor: pointer;
      transition: all 0.3s;
    }
    .btn-wishlist:hover { border-color: #e74c3c; background: #fee; }
    .cart-success {
      display: none;
      align-items: center;
      gap: 10px;
      background: #d4edda;
      color: #155724;
      padding: 12px 18px;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      margin-top: 10px;
    }
    .cart-success.show { display: flex; }
    .cart-success a { color: #119EAE; font-weight: 700; }

    .pi-meta { border-top: 1px solid #f0f0f0; padding-top: 18px; margin: 18px 0; }
    .meta-row {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
      color: #555;
      margin-bottom: 8px;
    }
    .meta-row > span:first-child { color: #aaa; min-width: 80px; }
    .meta-row a { color: #119EAE; }
    .share-btns { display: flex; gap: 8px; }
    .share-btns a {
      padding: 4px 12px;
      border: 1px solid #e0e0e0;
      border-radius: 20px;
      font-size: 11px;
      color: #555;
      transition: all 0.2s;
    }
    .share-btns a:hover { background: #119EAE; color: #fff; border-color: #119EAE; }

    .trust-badges {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .trust-item {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #f8f9fa;
      border-radius: 8px;
      padding: 10px 14px;
      font-size: 12px;
      color: #555;
      font-weight: 500;
    }
    .trust-item span { font-size: 18px; }

    /* Tabs */
    .tabs-section { background: #f8f9fa; padding: 60px 0; }
    .tabs-bar {
      display: flex;
      gap: 0;
      border-bottom: 2px solid #e0e0e0;
      margin-bottom: 30px;
    }
    .tabs-bar button {
      padding: 14px 28px;
      border: none;
      background: none;
      font-size: 14px;
      font-weight: 600;
      color: #777;
      cursor: pointer;
      border-bottom: 3px solid transparent;
      margin-bottom: -2px;
      transition: all 0.2s;
    }
    .tabs-bar button.active { color: #119EAE; border-bottom-color: #119EAE; }
    .tabs-bar button:hover { color: #119EAE; }

    .tab-body h3 { font-size: 20px; font-weight: 700; margin-bottom: 15px; }
    .tab-body h4 { font-size: 15px; font-weight: 700; margin: 20px 0 10px; }
    .tab-body p { font-size: 14px; color: #555; line-height: 1.8; margin-bottom: 12px; }
    .spec-table { width: 100%; border-collapse: collapse; margin-top: 15px; }
    .spec-table tr:nth-child(even) { background: #f5f5f5; }
    .spec-table td { padding: 10px 16px; font-size: 13px; color: #444; border-bottom: 1px solid #eee; }
    .spec-key { font-weight: 600; color: #1a1a2e; width: 200px; }

    /* Reviews */
    .review-summary { display: flex; gap: 40px; margin-bottom: 30px; }
    .avg-score { text-align: center; }
    .big-score { font-size: 56px; font-weight: 800; color: #1a1a2e; font-family: 'Poppins', sans-serif; }
    .big-stars { font-size: 20px; }
    .rating-bars { flex: 1; }
    .rbar { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; font-size: 13px; }
    .bar { flex: 1; background: #e0e0e0; border-radius: 4px; height: 8px; overflow: hidden; }
    .fill { height: 100%; background: #f39c12; border-radius: 4px; }
    .pct { width: 35px; text-align: right; color: #888; font-size: 12px; }
    .review-list { display: flex; flex-direction: column; gap: 16px; }
    .review-card { background: #fff; border-radius: 12px; padding: 20px; border: 1px solid #f0f0f0; }
    .rv-top { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .rv-avatar {
      width: 40px; height: 40px; background: #119EAE; color: #fff;
      border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 16px; flex-shrink: 0;
    }
    .rv-stars { font-size: 13px; }
    .rv-date { margin-left: auto; font-size: 12px; color: #bbb; }

    /* Shipping Tab */
    .shipping-info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
    .si-card {
      background: #fff;
      border-radius: 12px;
      padding: 25px 20px;
      text-align: center;
      border: 1px solid #eee;
    }
    .si-icon { font-size: 36px; display: block; margin-bottom: 12px; }
    .si-card h4 { font-size: 15px; font-weight: 700; margin-bottom: 8px; }
    .si-card p { font-size: 13px; color: #777; }
    .si-price { color: #119EAE !important; font-weight: 700 !important; margin-top: 8px !important; }

    /* Related */
    .related-section { padding: 60px 0; background: #fff; }
    .section-title { font-size: 22px; font-weight: 700; margin-bottom: 25px; padding-bottom: 10px; border-bottom: 3px solid #119EAE; display: inline-block; }
    .related-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }

    /* Loading */
    .loading-screen { text-align: center; padding: 120px 20px; }
    .spinner {
      width: 48px; height: 48px;
      border: 4px solid #e0e0e0;
      border-top-color: #119EAE;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 1024px) {
      .product-layout { grid-template-columns: 1fr; }
      .related-grid { grid-template-columns: repeat(2, 1fr); }
      .shipping-info-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 768px) {
      .pi-features ul { grid-template-columns: 1fr; }
      .trust-badges { grid-template-columns: 1fr; }
      .review-summary { flex-direction: column; }
      .related-grid { grid-template-columns: 1fr 1fr; }
      .shipping-info-grid { grid-template-columns: 1fr 1fr; }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private productService = inject(ProductService);
    private cartService = inject(CartService);

    product: Product | undefined;
    relatedProducts: Product[] = [];
    qty = 1;
    selectedColorIndex = 0;
    selectedColor = 'Default';
    wishlisted = false;
    showSuccess = false;
    activeTab = 'desc';

    colorLabels = ['Black', 'Silver', 'White', 'Gold', 'Blue', 'Red', 'Green'];

    demoReviews = [
        { id: 1, name: 'Alex Johnson', stars: 5, date: 'Jan 15, 2024', text: 'Absolutely love this product! The build quality is exceptional and it performs exactly as described. Delivery was fast and packaging was secure. Highly recommended!' },
        { id: 2, name: 'Sarah Chen', stars: 5, date: 'Feb 3, 2024', text: 'Exceeded my expectations. Worth every penny. The features are exactly as listed and customer support was helpful when I had questions about setup.' },
        { id: 3, name: 'Michael Roberts', stars: 4, date: 'Feb 18, 2024', text: 'Great product overall. Only minor issue is the manual could be clearer, but once set up it works perfectly. Would buy again from Electshop.' },
        { id: 4, name: 'Emma Wilson', stars: 5, date: 'Mar 5, 2024', text: 'Bought as a gift and the recipient was thrilled. Came in perfect condition with all accessories included. Fantastic value for money!' },
    ];

    ngOnInit() {
        this.route.params.subscribe(params => {
            const id = +params['id'];
            this.productService.getProductById(id).subscribe(p => {
                this.product = p;
                if (p) {
                    this.selectedColor = this.colorLabels[0];
                    this.productService.getRelatedProducts(id, p.category).subscribe(r => this.relatedProducts = r);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        });
    }

    addToCart() {
        if (!this.product || !this.product.inStock) return;
        for (let i = 0; i < this.qty; i++) this.cartService.addToCart(this.product);
        this.showSuccess = true;
        setTimeout(() => this.showSuccess = false, 3000);
    }

    toggleWishlist() { this.wishlisted = !this.wishlisted; }
    incQty() { this.qty = Math.min(this.qty + 1, 99); }
    decQty() { this.qty = Math.max(this.qty - 1, 1); }

    getRatingPct(star: number): number {
        const pcts: { [k: number]: number } = { 5: 68, 4: 20, 3: 7, 2: 3, 1: 2 };
        return pcts[star] || 0;
    }
}
