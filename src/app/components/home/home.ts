import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ProductService, Product, Category } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { ProductCardComponent } from '../product-card/product-card';
import { HeroSliderComponent } from '../hero-slider/hero-slider';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent, HeroSliderComponent],
  template: `
    <!-- Hero Slider -->
    <app-hero-slider></app-hero-slider>

    <!-- Latest Products -->
    <section class="section-pad">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Latest Products</h2>
          <a routerLink="/shop" id="view-all-latest" class="view-all-btn">View All <span>→</span></a>
        </div>
        <div class="products-grid">
          <app-product-card *ngFor="let p of latestProducts" [product]="p"></app-product-card>
        </div>
      </div>
    </section>

    <!-- Promo Banners Row -->
    <section class="promo-banners">
      <div class="container">
        <div class="banners-grid">
          <div class="promo-banner banner-vr" id="promo-vr" [routerLink]="['/shop']" [queryParams]="{category:'Gaming'}">
            <div class="banner-content">
              <span>VR & Gaming</span>
              <h3>Enter the<br><strong>Metaverse</strong></h3>
              <a id="promo-vr-btn">Shop Now →</a>
            </div>
            <img src="https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=200&h=160&fit=crop" alt="VR Headset" />
          </div>
          <div class="promo-banner banner-laptop" id="promo-laptop" [routerLink]="['/shop']" [queryParams]="{category:'Laptops'}">
            <div class="banner-content">
              <span>MacBooks</span>
              <h3>Power Your<br><strong>Workflow</strong></h3>
              <a id="promo-laptop-btn">Explore →</a>
            </div>
            <img src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&h=160&fit=crop" alt="MacBook" />
          </div>
          <div class="promo-banner banner-phone" id="promo-phone" [routerLink]="['/shop']" [queryParams]="{category:'Phones'}">
            <div class="banner-content dark">
              <span>Smartphones</span>
              <h3>Stay Always<br><strong>Connected</strong></h3>
              <a id="promo-phone-btn">Buy Now →</a>
            </div>
            <img src="https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?w=200&h=160&fit=crop" alt="Phone" />
          </div>
        </div>
      </div>
    </section>

    <!-- Trending Products (Tabbed) -->
    <section class="section-pad trending-section">
      <div class="container">
        <div class="trending-layout">
          <div class="trending-products">
            <div class="section-header">
              <h2 class="section-title">Trending Products</h2>
              <div class="tabs">
                <button *ngFor="let tab of trendingTabs"
                  [class.active]="activeTab === tab"
                  [id]="'tab-' + tab.toLowerCase().replace(' ', '-')"
                  (click)="setTab(tab)"
                  class="tab-btn">{{ tab }}</button>
              </div>
            </div>
            <div class="products-grid-4">
              <app-product-card *ngFor="let p of trendingProducts.slice(0,4)" [product]="p"></app-product-card>
            </div>
          </div>

          <!-- Sidebar Deal -->
          <div class="deal-sidebar">
            <div class="deal-card" id="featured-deal-card">
              <span class="deal-label">⚡ HOT DEAL</span>
              <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=260&fit=crop" alt="Deal Product" />
              <h4>Sony WH-1000XM5<br>Wireless Headphones</h4>
              <div class="deal-price">
                <span class="d-price">$279.99</span>
                <span class="d-old">$399.99</span>
              </div>
              <div class="deal-stars">⭐⭐⭐⭐⭐ <small>(238 reviews)</small></div>
              <button class="deal-btn" id="deal-sidebar-cart-btn">🛒 ADD TO CART</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Deal of the Day -->
    <section class="deal-of-day">
      <div class="container">
        <div class="deal-header">
          <h2 class="section-title" style="color:#fff">Deal of the Day</h2>
          <div class="countdown" id="countdown-timer">
            <div class="time-unit" *ngFor="let unit of timeUnits">
              <span class="time-val">{{ unit.value }}</span>
              <span class="time-label">{{ unit.label }}</span>
            </div>
          </div>
        </div>
        <div class="deals-grid">
          <div class="deal-item" *ngFor="let p of dealProducts; let i = index" [id]="'deal-item-' + p.id" [routerLink]="['/product', p.id]">
            <div class="deal-image-wrap">
              <img [src]="p.image" [alt]="p.name" />
              <div class="deal-discount">-{{ p.discount }}%</div>
            </div>
            <div class="deal-info">
              <span class="d-brand">{{ p.brand }}</span>
              <h4>{{ p.name | slice:0:45 }}...</h4>
              <div class="d-rating">⭐⭐⭐⭐⭐ ({{ p.reviews }})</div>
              <div class="d-price-row">
                <span class="d-price">\${{ p.price.toFixed(2) }}</span>
                <span class="d-old">\${{ p.oldPrice.toFixed(2) }}</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" [style.width]="getProgress(i) + '%'"></div>
              </div>
              <p class="sold-text">{{ getSold(i) }} sold of {{ getTotal(i) }}</p>
              <button class="deal-cart-btn" [id]="'deal-cart-' + p.id" (click)="addDealToCart($event, p)">ADD TO CART</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Categories -->
    <section class="section-pad">
      <div class="container">
        <h2 class="section-title center">Shop by Category</h2>
        <div class="categories-scroll">
          <div class="category-card" *ngFor="let cat of categories" [id]="'cat-' + cat.id"
            [routerLink]="['/shop']" [queryParams]="{category: cat.slug}" style="cursor:pointer">
            <div class="cat-icon-wrap" [style.background]="cat.color + '20'" [style.border-color]="cat.color + '40'">
              <span class="cat-icon">{{ cat.icon }}</span>
            </div>
            <span class="cat-name">{{ cat.name }}</span>
            <span class="cat-count">{{ cat.count }} items</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Best Selling + Featured -->
    <section class="section-pad" style="background:#f8f9fa">
      <div class="container">
        <div class="two-col-section">
          <div class="col-products">
            <h2 class="section-title">Best Selling</h2>
            <div class="best-sell-list">
              <div class="best-sell-item" *ngFor="let p of latestProducts.slice(0,5); let i = index" [id]="'bestsell-' + p.id" [routerLink]="['/product', p.id]" style="cursor:pointer">
                <div class="bs-rank">{{ i + 1 }}</div>
                <img [src]="p.image" [alt]="p.name" />
                <div class="bs-info">
                  <span class="bs-brand">{{ p.brand }}</span>
                  <a class="bs-name">{{ p.name | slice:0:40 }}...</a>
                  <div class="bs-price">
                    <span class="price-now">\${{ p.price.toFixed(2) }}</span>
                    <span class="price-was">\${{ p.oldPrice.toFixed(2) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-products">
            <h2 class="section-title">Top Reviewed</h2>
            <div class="best-sell-list">
              <div class="best-sell-item" *ngFor="let p of latestProducts.slice(2,7); let i = index" [id]="'toprev-' + p.id" [routerLink]="['/product', p.id]" style="cursor:pointer">
                <div class="bs-rank" style="background:#f39c12">{{ i + 1 }}</div>
                <img [src]="p.image" [alt]="p.name" />
                <div class="bs-info">
                  <span class="bs-brand">{{ p.brand }}</span>
                  <a class="bs-name">{{ p.name | slice:0:40 }}...</a>
                  <div class="bs-stars">⭐⭐⭐⭐⭐ ({{ p.reviews }})</div>
                  <div class="bs-price">
                    <span class="price-now">\${{ p.price.toFixed(2) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="testimonials-section">
      <div class="container">
        <h2 class="section-title center" style="color:#fff">What Our Customers Say</h2>
        <div class="testimonials-grid">
          <div class="testimonial-card" *ngFor="let t of testimonials; let i = index" [id]="'testimonial-' + i">
            <div class="t-quote">"</div>
            <p>{{ t.text }}</p>
            <div class="t-author">
              <div class="t-avatar">{{ t.name[0] }}</div>
              <div>
                <strong>{{ t.name }}</strong>
                <span>{{ t.role }}</span>
              </div>
              <div class="t-stars">⭐⭐⭐⭐⭐</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Brand Logos -->
    <section class="brands-section">
      <div class="container">
        <h2 class="section-title center">Our Trusted Brands</h2>
        <div class="brands-grid">
          <div class="brand-item" *ngFor="let b of brands; let i = index" [id]="'brand-' + i"
            [routerLink]="['/shop']" [queryParams]="{brand: b}" style="cursor:pointer">{{ b }}</div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .section-pad { padding: 60px 0; }
    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 25px;
    }
    .section-title {
      font-size: 22px;
      font-weight: 700;
      color: #1a1a2e;
      position: relative;
      padding-bottom: 10px;
    }
    .section-title::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 45px;
      height: 3px;
      background: #119EAE;
      border-radius: 2px;
    }
    .section-title.center { text-align: center; }
    .section-title.center::after { left: 50%; transform: translateX(-50%); }
    .view-all-btn {
      color: #119EAE;
      font-weight: 600;
      font-size: 13px;
      text-decoration: none;
      transition: all 0.2s;
    }
    .view-all-btn:hover { color: #0d849a; }
    .products-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }
    .products-grid-4 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    /* Promo Banners */
    .promo-banners { padding: 0 0 50px; }
    .banners-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
    .promo-banner {
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      align-items: center;
      padding: 25px 20px;
      gap: 15px;
      cursor: pointer;
      transition: transform 0.3s;
      position: relative;
    }
    .promo-banner:hover { transform: translateY(-4px); }
    .banner-vr { background: linear-gradient(135deg, #e8f7f9, #c5ebf0); }
    .banner-laptop { background: linear-gradient(135deg, #fef9e7, #fdeaa0); }
    .banner-phone { background: linear-gradient(135deg, #1a1a2e, #2d3561); }
    .banner-content { flex: 1; }
    .banner-content span {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #119EAE;
    }
    .banner-content.dark span { color: #f39c12; }
    .banner-content h3 { font-size: 18px; margin: 6px 0; color: #1a1a2e; line-height: 1.3; }
    .banner-content h3 strong { color: #119EAE; }
    .banner-content.dark h3 { color: #fff; }
    .banner-content.dark h3 strong { color: #f39c12; }
    .banner-content a {
      color: #119EAE;
      font-size: 13px;
      font-weight: 700;
      text-decoration: none;
      transition: 0.2s;
    }
    .banner-content.dark a { color: #f39c12; }
    .promo-banner img { width: 120px; height: 100px; object-fit: contain; }

    /* Trending Section */
    .trending-section { background: #fff; }
    .trending-layout { display: grid; grid-template-columns: 1fr 260px; gap: 25px; }
    .tabs { display: flex; gap: 5px; }
    .tab-btn {
      padding: 7px 16px;
      border: 1px solid #e9ecef;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      background: #fff;
      color: #555;
      transition: all 0.3s;
    }
    .tab-btn.active, .tab-btn:hover { background: #119EAE; color: #fff; border-color: #119EAE; }
    .deal-sidebar {}
    .deal-card {
      background: linear-gradient(135deg, #f8f9fa, #e8f7f9);
      border-radius: 12px;
      padding: 20px;
      text-align: center;
      border: 1px solid #e0f0f3;
    }
    .deal-label {
      background: #e74c3c;
      color: #fff;
      padding: 3px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      display: inline-block;
      margin-bottom: 12px;
    }
    .deal-card img { width: 100%; max-height: 180px; object-fit: contain; margin-bottom: 12px; }
    .deal-card h4 { font-size: 14px; font-weight: 700; color: #1a1a2e; line-height: 1.4; margin-bottom: 10px; }
    .deal-price { display: flex; gap: 8px; justify-content: center; align-items: center; margin-bottom: 6px; }
    .d-price { font-size: 18px; font-weight: 700; color: #119EAE; }
    .d-old { font-size: 13px; text-decoration: line-through; color: #bbb; }
    .deal-stars { font-size: 13px; color: #666; margin-bottom: 12px; }
    .deal-btn {
      width: 100%;
      background: #119EAE;
      color: #fff;
      border: none;
      padding: 11px;
      border-radius: 8px;
      font-weight: 700;
      cursor: pointer;
      font-size: 13px;
      transition: background 0.3s;
    }
    .deal-btn:hover { background: #0d849a; }

    /* Deal of the Day */
    .deal-of-day {
      background: linear-gradient(135deg, #1a1a2e, #2d3561);
      padding: 60px 0;
    }
    .deal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .countdown { display: flex; gap: 15px; }
    .time-unit {
      background: rgba(255,255,255,0.1);
      border-radius: 8px;
      padding: 10px 16px;
      text-align: center;
      min-width: 65px;
      backdrop-filter: blur(5px);
    }
    .time-val { display: block; font-size: 26px; font-weight: 800; color: #fff; font-family: 'Poppins', sans-serif; }
    .time-label { font-size: 10px; color: rgba(255,255,255,0.6); text-transform: uppercase; letter-spacing: 1px; }
    .deals-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
    .deal-item {
      background: rgba(255,255,255,0.05);
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid rgba(255,255,255,0.08);
      transition: transform 0.3s;
    }
    .deal-item:hover { transform: translateY(-4px); background: rgba(255,255,255,0.08); }
    .deal-image-wrap {
      position: relative;
      background: rgba(255,255,255,0.03);
      height: 160px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .deal-image-wrap img { max-height: 140px; object-fit: contain; padding: 10px; }
    .deal-discount {
      position: absolute;
      top: 10px;
      right: 10px;
      background: #e74c3c;
      color: #fff;
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
    }
    .deal-info { padding: 14px; }
    .d-brand { font-size: 11px; color: #119EAE; font-weight: 600; text-transform: uppercase; display: block; margin-bottom: 4px; }
    .deal-info h4 { font-size: 13px; font-weight: 600; color: #fff; margin-bottom: 6px; line-height: 1.4; }
    .d-rating { font-size: 11px; color: #aaa; margin-bottom: 8px; }
    .d-price-row { display: flex; gap: 8px; align-items: center; margin-bottom: 10px; }
    .progress-bar { background: rgba(255,255,255,0.1); border-radius: 4px; height: 5px; margin-bottom: 4px; overflow: hidden; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #119EAE, #f39c12); border-radius: 4px; transition: width 0.8s ease; }
    .sold-text { font-size: 11px; color: #aaa; margin-bottom: 10px; }
    .deal-cart-btn {
      width: 100%;
      background: #119EAE;
      color: #fff;
      border: none;
      padding: 9px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      transition: background 0.3s;
    }
    .deal-cart-btn:hover { background: #0d849a; }

    /* Categories */
    .categories-scroll {
      display: flex;
      gap: 20px;
      overflow-x: auto;
      padding-bottom: 10px;
      scrollbar-width: thin;
      scrollbar-color: #119EAE #f0f0f0;
    }
    .category-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      min-width: 120px;
      padding: 20px 15px;
      background: #fff;
      border-radius: 12px;
      border: 1px solid #f0f0f0;
      cursor: pointer;
      transition: all 0.3s;
      text-align: center;
    }
    .category-card:hover { transform: translateY(-5px); box-shadow: 0 8px 25px rgba(17,158,174,0.15); border-color: #119EAE; }
    .cat-icon-wrap {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid;
    }
    .cat-icon { font-size: 26px; }
    .cat-name { font-size: 13px; font-weight: 600; color: #1a1a2e; }
    .cat-count { font-size: 11px; color: #999; }

    /* Two Column Section */
    .two-col-section { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
    .best-sell-list { display: flex; flex-direction: column; gap: 12px; }
    .best-sell-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: #fff;
      border-radius: 10px;
      border: 1px solid #f0f0f0;
      transition: all 0.3s;
    }
    .best-sell-item:hover { border-color: #119EAE; box-shadow: 0 4px 15px rgba(17,158,174,0.1); }
    .bs-rank {
      width: 28px;
      height: 28px;
      background: #119EAE;
      color: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 700;
      flex-shrink: 0;
    }
    .best-sell-item img { width: 60px; height: 60px; object-fit: contain; border-radius: 8px; background: #f9f9f9; padding: 5px; }
    .bs-info { flex: 1; }
    .bs-brand { font-size: 10px; color: #119EAE; font-weight: 600; text-transform: uppercase; display: block; }
    .bs-name { font-size: 13px; font-weight: 600; color: #1a1a2e; display: block; line-height: 1.3; margin-bottom: 4px; }
    .bs-stars { font-size: 11px; color: #aaa; margin-bottom: 2px; }
    .bs-price { display: flex; gap: 8px; align-items: center; }
    .price-now { font-size: 14px; font-weight: 700; color: #119EAE; }
    .price-was { font-size: 12px; text-decoration: line-through; color: #bbb; }

    /* Testimonials */
    .testimonials-section {
      background: linear-gradient(135deg, #119EAE, #0d849a);
      padding: 70px 0;
    }
    .testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 25px; }
    .testimonial-card {
      background: rgba(255,255,255,0.12);
      border-radius: 12px;
      padding: 28px;
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.2);
      transition: transform 0.3s;
    }
    .testimonial-card:hover { transform: translateY(-5px); background: rgba(255,255,255,0.18); }
    .t-quote { font-size: 48px; color: rgba(255,255,255,0.3); font-family: Georgia; line-height: 1; margin-bottom: 8px; }
    .testimonial-card p { color: rgba(255,255,255,0.9); font-size: 14px; line-height: 1.8; margin-bottom: 20px; }
    .t-author { display: flex; align-items: center; gap: 12px; }
    .t-avatar {
      width: 44px;
      height: 44px;
      background: rgba(255,255,255,0.3);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 700;
      color: #fff;
      flex-shrink: 0;
    }
    .t-author div:nth-child(2) { flex: 1; }
    .t-author strong { display: block; color: #fff; font-size: 14px; }
    .t-author span { color: rgba(255,255,255,0.65); font-size: 12px; }
    .t-stars { font-size: 13px; }

    /* Brands */
    .brands-section { padding: 50px 0; background: #f9f9f9; }
    .brands-grid {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
      justify-content: center;
      margin-top: 30px;
    }
    .brand-item {
      padding: 14px 28px;
      background: #fff;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      font-weight: 700;
      font-size: 15px;
      color: #888;
      transition: all 0.3s;
      cursor: pointer;
      letter-spacing: 1px;
    }
    .brand-item:hover {
      border-color: #119EAE;
      color: #119EAE;
      box-shadow: 0 4px 15px rgba(17,158,174,0.1);
      transform: translateY(-2px);
    }

    @media (max-width: 1024px) {
      .trending-layout { grid-template-columns: 1fr; }
      .deal-sidebar { display: none; }
      .deals-grid { grid-template-columns: repeat(2, 1fr); }
      .two-col-section { grid-template-columns: 1fr; }
    }
    @media (max-width: 768px) {
      .products-grid { grid-template-columns: repeat(2, 1fr); }
      .banners-grid { grid-template-columns: 1fr; }
      .testimonials-grid { grid-template-columns: 1fr; }
      .deals-grid { grid-template-columns: 1fr; }
      .deal-header { flex-direction: column; align-items: flex-start; gap: 15px; }
    }
  `]
})
export class HomeComponent implements OnInit, OnDestroy {
  productService = inject(ProductService);
  cartService = inject(CartService);
  router = inject(Router);

  latestProducts: Product[] = [];
  trendingProducts: Product[] = [];
  dealProducts: Product[] = [];
  categories: Category[] = [];
  activeTab = 'Electronics';
  trendingTabs = ['Electronics', 'Gadgets', 'Smart Devices'];

  timeUnits = [
    { label: 'Days', value: '02' },
    { label: 'Hours', value: '14' },
    { label: 'Min', value: '37' },
    { label: 'Sec', value: '52' },
  ];
  private timer: any;

  testimonials = [
    { name: 'Alex Johnson', role: 'Web Developer', text: 'Electshop is my go-to for all tech purchases. The product quality is outstanding and delivery was faster than expected. Highly recommend!' },
    { name: 'Sarah Chen', role: 'UX Designer', text: 'Amazing selection and unbeatable prices. The return policy is hassle-free and customer support was incredibly helpful when I had questions.' },
    { name: 'Michael Roberts', role: 'Startup Founder', text: 'Bought MacBook Pro and AirPods for my whole team. The bulk discount was fantastic and every product arrived perfectly packaged. 5 stars!' },
  ];

  brands = ['Samsung', 'Apple', 'Sony', 'Microsoft', 'LG', 'Bose', 'DJI', 'ASUS', 'Canon', 'JBL'];

  ngOnInit() {
    this.productService.getLatestProducts().subscribe(p => this.latestProducts = p);
    this.productService.getProductsByTab('Electronics').subscribe(p => this.trendingProducts = p);
    this.productService.getDealProducts().subscribe(p => this.dealProducts = p.slice(0, 4));
    this.productService.getCategories().subscribe(c => this.categories = c);
    this.startTimer();
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  startTimer() {
    let totalSeconds = 2 * 86400 + 14 * 3600 + 37 * 60 + 52;
    this.timer = setInterval(() => {
      if (totalSeconds <= 0) { clearInterval(this.timer); return; }
      totalSeconds--;
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const mins = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;
      this.timeUnits[0].value = String(days).padStart(2, '0');
      this.timeUnits[1].value = String(hours).padStart(2, '0');
      this.timeUnits[2].value = String(mins).padStart(2, '0');
      this.timeUnits[3].value = String(secs).padStart(2, '0');
    }, 1000);
  }

  setTab(tab: string) {
    this.activeTab = tab;
    this.productService.getProductsByTab(tab).subscribe(p => this.trendingProducts = p);
  }

  addDealToCart(event: Event, product: Product) {
    event.stopPropagation();
    this.cartService.addToCart(product);
  }

  getProgress(i: number) { return [72, 45, 88, 33][i % 4]; }
  getSold(i: number) { return [144, 90, 176, 66][i % 4]; }
  getTotal(i: number) { return [200, 200, 200, 200][i % 4]; }
}
