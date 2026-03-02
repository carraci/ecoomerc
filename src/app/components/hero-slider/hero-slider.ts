import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart.service';

interface Slide {
    id: number;
    subtitle: string;
    title: string;
    highlight: string;
    description: string;
    price: string;
    oldPrice: string;
    discount: string;
    image: string;
    bg: string;
    btnText: string;
}

@Component({
    selector: 'app-hero-slider',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
    <div class="hero-section">
      <!-- Main Slider -->
      <div class="slider-container">
        <div class="slides-wrapper" [style.transform]="'translateX(-' + (currentSlide * 100) + '%)'">
          <div class="slide" *ngFor="let slide of slides; let i = index" [style.background]="slide.bg">
            <div class="container slide-inner">
              <div class="slide-content">
                <span class="slide-subtitle animate-in">{{ slide.subtitle }}</span>
                <h1 class="slide-title animate-in">{{ slide.title }} <span class="highlight">{{ slide.highlight }}</span></h1>
                <p class="slide-desc animate-in">{{ slide.description }}</p>
                <div class="slide-price animate-in">
                  <span class="current-price">{{ slide.price }}</span>
                  <span class="old-price">{{ slide.oldPrice }}</span>
                  <span class="off-badge">{{ slide.discount }} OFF</span>
                </div>
                <div class="slide-actions animate-in">
                  <a routerLink="/shop" id="hero-shop-btn-{{i}}" class="btn-hero-primary">
                    {{ slide.btnText }}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </a>
                  <a href="#" id="hero-wishlist-btn-{{i}}" class="btn-hero-outline">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    Wishlist
                  </a>
                </div>
              </div>
              <div class="slide-image">
                <div class="image-glow"></div>
                <img [src]="slide.image" [alt]="slide.title" loading="lazy"/>
              </div>
            </div>
          </div>
        </div>

        <!-- Prev/Next Buttons -->
        <button class="slider-btn prev" id="slider-prev" (click)="prevSlide()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
        <button class="slider-btn next" id="slider-next" (click)="nextSlide()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 18l6-6-6-6"/></svg>
        </button>

        <!-- Dots -->
        <div class="slider-dots">
          <button *ngFor="let slide of slides; let i = index"
            class="dot" [class.active]="i === currentSlide"
            [id]="'slider-dot-' + i"
            (click)="goToSlide(i)"></button>
        </div>
      </div>

      <!-- Side Banners -->
      <div class="side-banners">
        <div class="side-banner banner-1" id="side-banner-1">
          <div class="side-content">
            <span class="s-label">SPECIAL OFFER</span>
            <h3>Discount Up To<br><strong>20% Off</strong></h3>
            <p>Top deals from <span>\$50</span></p>
          </div>
          <img src="https://images.unsplash.com/photo-1605406703909-e1d9e36cf1ba?w=180&h=130&fit=crop" alt="Gaming Controller" />
        </div>
        <div class="side-banner banner-2" id="side-banner-2">
          <div class="side-content dark">
            <span class="s-label">SPECIAL SALE</span>
            <h3>Up To 30% Off<br><strong>New Arrivals</strong></h3>
          </div>
          <img src="https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?w=180&h=130&fit=crop" alt="Smartphone" />
        </div>
      </div>
    </div>

    <!-- Service Features -->
    <section class="services-bar">
      <div class="container">
        <div class="services-grid">
          <div class="service-item" *ngFor="let s of services">
            <div class="service-icon">{{ s.icon }}</div>
            <div class="service-text">
              <h4>{{ s.title }}</h4>
              <p>{{ s.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
    styles: [`
    .hero-section {
      display: flex;
      gap: 15px;
      padding: 15px 0;
      background: #f5f5f5;
    }
    .slider-container {
      flex: 1;
      position: relative;
      overflow: hidden;
      border-radius: 12px;
      min-height: 380px;
    }
    .slides-wrapper {
      display: flex;
      transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      height: 100%;
    }
    .slide {
      min-width: 100%;
      min-height: 380px;
      padding: 40px 0;
      display: flex;
      align-items: center;
    }
    .slide-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 30px;
    }
    .slide-content { flex: 1; max-width: 50%; }
    .slide-subtitle {
      display: inline-block;
      background: rgba(255,255,255,0.2);
      color: inherit;
      padding: 4px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 12px;
      backdrop-filter: blur(4px);
    }
    .slide-title {
      font-size: 36px;
      font-weight: 800;
      line-height: 1.1;
      margin-bottom: 12px;
      font-family: 'Poppins', sans-serif;
    }
    .highlight { color: #ffd700; }
    .slide-desc { font-size: 15px; opacity: 0.85; margin-bottom: 15px; line-height: 1.6; }
    .slide-price { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
    .current-price { font-size: 28px; font-weight: 800; }
    .old-price { text-decoration: line-through; opacity: 0.6; font-size: 16px; }
    .off-badge {
      background: #e74c3c;
      color: #fff;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
    }
    .slide-actions { display: flex; gap: 12px; align-items: center; }
    .btn-hero-primary {
      background: #fff;
      color: #119EAE;
      padding: 12px 26px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 14px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s;
      text-decoration: none;
    }
    .btn-hero-primary:hover { background: #119EAE; color: #fff; transform: translateY(-2px); }
    .btn-hero-outline {
      border: 2px solid rgba(255,255,255,0.6);
      color: #fff;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 14px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.3s;
      text-decoration: none;
    }
    .btn-hero-outline:hover { background: rgba(255,255,255,0.15); border-color: #fff; }
    .slide-image {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      max-width: 46%;
    }
    .image-glow {
      position: absolute;
      width: 280px;
      height: 280px;
      background: radial-gradient(circle, rgba(255,255,255,0.2), transparent);
      border-radius: 50%;
    }
    .slide-image img {
      max-height: 300px;
      object-fit: contain;
      filter: drop-shadow(0 20px 40px rgba(0,0,0,0.3));
      position: relative;
      z-index: 1;
      animation: float 3s ease-in-out infinite;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-12px); }
    }
    .slider-btn {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255,255,255,0.9);
      color: #333;
      width: 42px;
      height: 42px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;
      z-index: 10;
      box-shadow: 0 4px 15px rgba(0,0,0,0.15);
    }
    .slider-btn:hover { background: #119EAE; color: #fff; }
    .prev { left: 15px; }
    .next { right: 15px; }
    .slider-dots {
      position: absolute;
      bottom: 15px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 8px;
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(255,255,255,0.5);
      border: none;
      cursor: pointer;
      transition: all 0.3s;
      padding: 0;
    }
    .dot.active { background: #fff; width: 20px; border-radius: 4px; }

    /* Side Banners */
    .side-banners { display: flex; flex-direction: column; gap: 15px; width: 280px; flex-shrink: 0; }
    .side-banner {
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      align-items: center;
      padding: 20px;
      gap: 15px;
      cursor: pointer;
      transition: transform 0.3s;
      flex: 1;
    }
    .side-banner:hover { transform: translateY(-3px); }
    .banner-1 { background: linear-gradient(135deg, #e8f7f9, #b8eaf0); }
    .banner-2 { background: linear-gradient(135deg, #1a1a2e, #16213e); }
    .side-content { flex: 1; }
    .side-content .s-label {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #119EAE;
      display: block;
      margin-bottom: 5px;
    }
    .side-content h3 { font-size: 15px; color: #1a1a2e; line-height: 1.4; }
    .side-content h3 strong { color: #119EAE; }
    .side-content p { font-size: 12px; color: #666; margin-top: 5px; }
    .side-content p span { color: #e74c3c; font-weight: 700; }
    .side-content.dark h3 { color: #fff; }
    .side-content.dark .s-label { color: #f39c12; }
    .side-banner img { width: 90px; height: 80px; object-fit: contain; }

    /* Services Bar */
    .services-bar {
      background: #fff;
      padding: 20px 0;
      border-top: 1px solid #f0f0f0;
      border-bottom: 3px solid #119EAE;
      box-shadow: 0 2px 10px rgba(0,0,0,0.04);
    }
    .services-grid { display: flex; justify-content: space-between; align-items: center; gap: 20px; }
    .service-item { display: flex; align-items: center; gap: 12px; }
    .service-icon { font-size: 28px; }
    .service-text h4 { font-size: 13px; font-weight: 700; color: #1a1a2e; }
    .service-text p { font-size: 12px; color: #777; }

    @media (max-width: 1024px) {
      .side-banners { display: none; }
    }
    @media (max-width: 768px) {
      .slide-title { font-size: 26px; }
      .slide-image { display: none; }
      .slide-content { max-width: 100%; }
      .services-grid { flex-wrap: wrap; gap: 15px; }
      .service-item { flex: 0 0 calc(50% - 10px); }
    }
  `]
})
export class HeroSliderComponent implements OnInit, OnDestroy {
    currentSlide = 0;
    private autoPlayInterval: any;

    slides: Slide[] = [
        {
            id: 1,
            subtitle: '🎵 New Collection 2024',
            title: 'Premium Wireless',
            highlight: 'Headphones',
            description: 'Experience crystal-clear sound with industry-leading noise cancellation technology.',
            price: '$279.99',
            oldPrice: '$399.99',
            discount: 'FLAT 30%',
            image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=500&fit=crop',
            bg: 'linear-gradient(135deg, #119EAE 0%, #0d6e7e 100%)',
            btnText: 'SHOP NOW'
        },
        {
            id: 2,
            subtitle: '💻 Best in Class',
            title: 'MacBook Pro M3',
            highlight: 'Powerhouse',
            description: 'Supercharged by the all-new M3 Pro chip for professionals who demand the best.',
            price: '$1,999.99',
            oldPrice: '$2,499.99',
            discount: '20%',
            image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&h=500&fit=crop',
            bg: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
            btnText: 'BUY NOW'
        },
        {
            id: 3,
            subtitle: '📱 Galaxy AI',
            title: 'Samsung Galaxy',
            highlight: 'S24 Ultra',
            description: 'The ultimate mobile AI experience with a built-in S Pen and powerful cameras.',
            price: '$1,199.99',
            oldPrice: '$1,399.99',
            discount: '14%',
            image: 'https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?w=600&h=500&fit=crop',
            bg: 'linear-gradient(135deg, #8e44ad 0%, #6c3483 100%)',
            btnText: 'EXPLORE'
        },
        {
            id: 4,
            subtitle: '🎮 Gaming Power',
            title: 'PlayStation 5',
            highlight: 'Console',
            description: 'Play with lightning speed. Experience next-generation gaming at its finest.',
            price: '$499.99',
            oldPrice: '$599.99',
            discount: 'SAVE 17%',
            image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&h=500&fit=crop',
            bg: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            btnText: 'GET IT NOW'
        }
    ];

    services = [
        { icon: '🚚', title: 'Free Shipping', desc: 'On orders over $99' },
        { icon: '🔄', title: '30 Days Returns', desc: 'Hassle-free returns' },
        { icon: '🔒', title: 'Secured Payment', desc: '100% secure & safe' },
        { icon: '🎁', title: 'Special Gifts', desc: 'For every purchase' },
        { icon: '💬', title: '24/7 Support', desc: 'We\'re always here' },
    ];

    ngOnInit() {
        this.startAutoPlay();
    }

    ngOnDestroy() {
        this.stopAutoPlay();
    }

    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => this.nextSlide(), 5000);
    }

    stopAutoPlay() {
        if (this.autoPlayInterval) clearInterval(this.autoPlayInterval);
    }

    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.slides.length;
    }

    prevSlide() {
        this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    }

    goToSlide(index: number) {
        this.currentSlide = index;
        this.stopAutoPlay();
        this.startAutoPlay();
    }
}
