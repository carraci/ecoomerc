import { Component, OnInit, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, FormsModule],
  template: `
    <!-- Top Bar -->
    <div class="top-bar">
      <div class="container top-bar-inner">
        <div class="top-left">
          <span>🚚 We ship nationwide. <strong>Free standard shipping on orders over $99.</strong></span>
        </div>
        <div class="top-right">
          <a href="#" id="track-order">Track Order</a>
          <a href="#" id="help-center">Help Center</a>
          <span class="divider">|</span>
          <span>🇺🇸 English</span>
          <span>$ USD</span>
        </div>
      </div>
    </div>

    <!-- Main Header -->
    <header class="main-header">
      <div class="container header-inner">
        <!-- Logo -->
        <a routerLink="/" id="logo-link" class="logo">
          <div class="logo-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#119EAE"/>
              <path d="M8 10h16M8 16h10M8 22h16" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
          </div>
          <span class="logo-text">Elect<strong>shop</strong></span>
        </a>

        <!-- Search Bar -->
        <div class="search-bar">
          <select class="search-category" id="search-category-select">
            <option>All Categories</option>
            <option>Phones</option>
            <option>Laptops</option>
            <option>Cameras</option>
            <option>Headphones</option>
            <option>Gaming</option>
            <option>Smart Devices</option>
            <option>TV & Speaker</option>
          </select>
          <input type="text" [(ngModel)]="searchQuery" id="search-input" placeholder="Search products here..." class="search-input" (keyup.enter)="onSearch()"/>
          <button class="search-btn" id="search-btn" (click)="onSearch()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </button>
        </div>

        <!-- Header Icons -->
        <div class="header-icons">
          <!-- Account: logged OUT -->
          <a routerLink="/login" id="account-link" class="header-icon-btn" *ngIf="!authService.isLoggedIn()">
            <div class="icon-wrap">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <span class="icon-label">Account<br><strong>Login</strong></span>
          </a>

          <!-- Account: logged IN -->
          <div class="user-menu-wrap" *ngIf="authService.isLoggedIn()">
            <button class="user-avatar-btn" id="user-menu-btn"
              (click)="toggleUserMenu($event)">
              <div class="user-avatar">{{ authService.initials() }}</div>
              <div class="icon-label">
                <span style="font-size:11px;color:#888">Hello,</span><br>
                <strong>{{ authService.displayName() || (authService.user()?.email ?? '').split('@')[0] }}</strong>
              </div>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                style="margin-left:4px;opacity:.5;transition:transform .3s"
                [style.transform]="userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)'">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>

            <!-- Dropdown -->
            <div class="user-dropdown" [class.open]="userMenuOpen" (click)="$event.stopPropagation()">
              <div class="ud-inner-box">
              <div class="ud-header">
                <div class="ud-avatar">{{ authService.initials() }}</div>
                <div>
                  <div class="ud-name">{{ authService.displayName() }}</div>
                  <div class="ud-email">{{ authService.user()?.email }}</div>
                </div>
              </div>
              <div class="ud-divider"></div>
              <a routerLink="/orders" class="ud-item" id="ud-orders" (click)="closeUserMenu()">📦 My Orders</a>
              <a routerLink="/wishlist" class="ud-item" id="ud-wishlist" (click)="closeUserMenu()">❤️ Wishlist</a>
              <a routerLink="/profile" class="ud-item" id="ud-profile" (click)="closeUserMenu()">👤 My Profile</a>
              <a routerLink="/profile" class="ud-item" id="ud-settings" (click)="closeUserMenu()">⚙️ Settings</a>
              <div class="ud-divider"></div>
              <button class="ud-logout" id="ud-logout" (click)="logout()">🚪 Sign Out</button>
              </div>
            </div>
          </div>
          <a routerLink="/wishlist" id="wishlist-link" class="header-icon-btn">
            <div class="icon-wrap">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              <span class="icon-count">0</span>
            </div>
          </a>
          <a routerLink="/cart" id="cart-link" class="header-icon-btn cart-btn">
            <div class="icon-wrap">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              <span class="icon-count">{{ cartService.count() }}</span>
            </div>
            <span class="icon-label">My Cart<br><strong>\${{ cartService.total().toFixed(2) }}</strong></span>
          </a>
        </div>
      </div>
    </header>

    <!-- Navigation -->
    <nav class="main-nav" [class.sticky]="isSticky">
      <div class="container nav-inner">
        <div class="browse-btn" id="browse-all-btn" (click)="toggleMegaMenu()">
          <span class="hamburger">
            <span></span><span></span><span></span>
          </span>
          BROWSE ALL CATEGORY
        </div>

        <!-- Categories Mega Menu -->
        <div class="mega-menu" [class.open]="showMegaMenu">
          <div class="mega-menu-columns">
            <div class="mega-col">
              <h4>Cameras</h4>
              <ul>
                <li><a [routerLink]="['/shop']" [queryParams]="{category:'Cameras'}">All Cameras</a></li>
                <li><a [routerLink]="['/shop']" [queryParams]="{category:'Cameras'}">Digital Camera</a></li>
                <li><a [routerLink]="['/shop']" [queryParams]="{category:'Cameras'}">Action Camera</a></li>
                <li><a [routerLink]="['/shop']" [queryParams]="{category:'Cameras'}">Drone Camera</a></li>
              </ul>
            </div>
            <div class="mega-col">
              <h4>Laptop &amp; Computers</h4>
              <ul>
                <li><a [routerLink]="['/shop']" [queryParams]="{category:'Laptops'}">All Laptops</a></li>
                <li><a [routerLink]="['/shop']" [queryParams]="{category:'Laptops'}">MacBook</a></li>
                <li><a [routerLink]="['/shop']" [queryParams]="{category:'Laptops'}">Gaming Laptops</a></li>
                <li><a [routerLink]="['/shop']" [queryParams]="{category:'Laptops'}">Ultraportable</a></li>
              </ul>
            </div>
            <div class="mega-col">
              <h4>Smart Devices</h4>
              <ul>
                <li><a [routerLink]="['/shop']" [queryParams]="{category:'Smart Devices'}">Smart Watches</a></li>
                <li><a [routerLink]="['/shop']" [queryParams]="{category:'Smart Devices'}">Smart Tablets</a></li>
                <li><a [routerLink]="['/shop']" [queryParams]="{category:'Smart Devices'}">Smart Speakers</a></li>
                <li><a [routerLink]="['/shop']" [queryParams]="{category:'Smart Devices'}">VR Headsets</a></li>
              </ul>
            </div>
            <div class="mega-col">
              <h4>Chargers &amp; Cables</h4>
              <ul>
                <li><a [routerLink]="['/shop']" [queryParams]="{category:'Chargers'}">All Chargers</a></li>
                <li><a [routerLink]="['/shop']" [queryParams]="{category:'Chargers'}">GaN Chargers</a></li>
                <li><a [routerLink]="['/shop']" [queryParams]="{category:'Chargers'}">Wireless Chargers</a></li>
                <li><a [routerLink]="['/shop']" [queryParams]="{category:'Chargers'}">Power Banks</a></li>
              </ul>
            </div>
            <div class="mega-col">
              <h4>Phones</h4>
              <ul>
                <li><a [routerLink]="['/shop']" [queryParams]="{category:'Phones'}">All Phones</a></li>
                <li><a [routerLink]="['/shop']" [queryParams]="{category:'Phones'}">iPhones</a></li>
                <li><a [routerLink]="['/shop']" [queryParams]="{category:'Phones'}">Android Phones</a></li>
                <li><a [routerLink]="['/shop']" [queryParams]="{category:'Phones'}">Foldable Phones</a></li>
              </ul>
            </div>
          </div>
        </div>

        <ul class="nav-links">
          <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}" id="nav-home">HOME</a></li>
          <li class="has-dropdown">
            <a routerLink="/shop" id="nav-shop">SHOP <span class="arrow">▾</span></a>
            <div class="dropdown">
              <a href="#" id="shop-new">New Arrivals</a>
              <a href="#" id="shop-featured">Featured</a>
              <a href="#" id="shop-bestsellers">Best Sellers</a>
              <a href="#" id="shop-sale">On Sale</a>
            </div>
          </li>
          <li class="has-dropdown">
            <a routerLink="/shop" id="nav-categories">CATEGORIES <span class="badge-sale">SALE</span> <span class="arrow">▾</span></a>
            <div class="dropdown">
              <a [routerLink]="['/shop']" [queryParams]="{category:'Phones'}">Phones</a>
              <a [routerLink]="['/shop']" [queryParams]="{category:'Laptops'}">Laptops</a>
              <a [routerLink]="['/shop']" [queryParams]="{category:'Cameras'}">Cameras</a>
              <a [routerLink]="['/shop']" [queryParams]="{category:'Headphones'}">Headphones</a>
              <a [routerLink]="['/shop']" [queryParams]="{category:'Gaming'}">Gaming</a>
              <a [routerLink]="['/shop']" [queryParams]="{category:'Smart Devices'}">Smart Devices</a>
              <a [routerLink]="['/shop']" [queryParams]="{category:'TV &amp; Speaker'}">TV &amp; Speaker</a>
              <a [routerLink]="['/shop']" [queryParams]="{category:'Chargers'}">Chargers</a>
            </div>
          </li>
          <li class="has-dropdown">
            <a href="#" id="nav-products">PRODUCTS <span class="badge-hot">HOT</span> <span class="arrow">▾</span></a>
            <div class="dropdown">
              <a [routerLink]="['/shop']" [queryParams]="{sort:'newest'}">New Arrivals</a>
              <a [routerLink]="['/shop']" [queryParams]="{sort:'rating'}">Featured</a>
              <a [routerLink]="['/shop']" [queryParams]="{sort:'reviews'}">Best Sellers</a>
              <a [routerLink]="['/shop']" [queryParams]="{sort:'discount'}">On Sale</a>
            </div>
          </li>
          <li class="has-dropdown">
            <a href="#" id="nav-top-deals">TOP DEALS <span class="arrow">▾</span></a>
            <div class="dropdown">
              <a [routerLink]="['/shop']" [queryParams]="{sort:'discount'}">Deal of the Day</a>
              <a [routerLink]="['/shop']" [queryParams]="{sort:'discount'}">Flash Sales</a>
              <a [routerLink]="['/shop']" [queryParams]="{sort:'price-asc'}">Clearance</a>
            </div>
          </li>
          <li class="has-dropdown">
            <a href="#" id="nav-elements">ELEMENTS <span class="arrow">▾</span></a>
            <div class="dropdown">
              <a routerLink="/">Home</a>
              <a routerLink="/shop">Shop</a>
              <a routerLink="/cart">Cart</a>
            </div>
          </li>
        </ul>
      </div>
    </nav>

    <!-- Mega Menu Overlay -->
    <div class="mega-overlay" [class.show]="showMegaMenu" (click)="toggleMegaMenu()"></div>
  `,
  styles: [`
    .top-bar {
      background: #1a1a2e;
      color: #ccc;
      font-size: 12px;
      padding: 7px 0;
    }
    .top-bar-inner {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .top-right {
      display: flex;
      gap: 16px;
      align-items: center;
    }
    .top-right a { color: #ccc; }
    .top-right a:hover { color: var(--primary); }
    .divider { color: #444; }
    .main-header {
      background: #fff;
      padding: 18px 0;
      box-shadow: 0 2px 10px rgba(0,0,0,0.06);
      position: relative;
      z-index: 100;
    }
    .header-inner {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-shrink: 0;
      text-decoration: none;
    }
    .logo-text {
      font-size: 22px;
      font-weight: 400;
      color: #1a1a2e;
      font-family: 'Poppins', sans-serif;
    }
    .logo-text strong { color: var(--primary); font-weight: 700; }
    .search-bar {
      flex: 1;
      display: flex;
      border: 2px solid var(--primary);
      border-radius: 8px;
      overflow: hidden;
      max-width: 600px;
    }
    .search-category {
      border: none;
      border-right: 1px solid #e0e0e0;
      padding: 0 12px;
      font-size: 13px;
      color: #444;
      background: #f9f9f9;
      cursor: pointer;
      min-width: 140px;
    }
    .search-input {
      flex: 1;
      border: none;
      padding: 11px 14px;
      font-size: 14px;
      color: #333;
    }
    .search-btn {
      background: var(--primary);
      color: #fff;
      padding: 0 20px;
      border: none;
      cursor: pointer;
      transition: background 0.3s;
      display: flex;
      align-items: center;
    }
    .search-btn:hover { background: var(--primary-dark); }
    .header-icons {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-shrink: 0;
    }
    .header-icon-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #333;
      text-decoration: none;
      position: relative;
    }
    .icon-wrap {
      position: relative;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
      border-radius: 50%;
      transition: all 0.3s;
    }
    .header-icon-btn:hover .icon-wrap {
      background: var(--primary);
      color: #fff;
    }
    .header-icon-btn:hover .icon-wrap svg { stroke: #fff; }
    .icon-count {
      position: absolute;
      top: -4px;
      right: -4px;
      background: var(--accent);
      color: #fff;
      font-size: 10px;
      font-weight: 700;
      min-width: 18px;
      height: 18px;
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
    }
    .icon-label {
      font-size: 11px;
      line-height: 1.4;
      color: #666;
    }
    .icon-label strong { color: #1a1a2e; font-size: 13px; }
    .cart-btn .icon-wrap { background: var(--primary); color: #fff; }
    .cart-btn .icon-wrap svg { stroke: #fff; }

    /* Navigation */
    .main-nav {
      background: #119EAE;
      position: relative;
      z-index: 200;
    }
    .main-nav.sticky {
      position: sticky;
      top: 0;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    }
    .nav-inner {
      display: flex;
      align-items: stretch;
    }
    .browse-btn {
      background: #0d849a;
      color: #fff;
      padding: 0 20px;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.5px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      user-select: none;
      transition: background 0.3s;
      min-width: 220px;
    }
    .browse-btn:hover { background: #0a6e80; }
    .hamburger {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .hamburger span {
      display: block;
      width: 18px;
      height: 2px;
      background: #fff;
      border-radius: 1px;
    }
    .nav-links {
      display: flex;
      align-items: center;
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .nav-links > li {
      position: relative;
    }
    .nav-links > li > a {
      display: flex;
      align-items: center;
      gap: 5px;
      color: #fff;
      padding: 16px 18px;
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.5px;
      transition: background 0.3s;
      text-decoration: none;
    }
    .nav-links > li > a:hover,
    .nav-links > li > a.active {
      background: rgba(0,0,0,0.15);
    }
    .arrow { font-size: 10px; opacity: 0.8; }
    .badge-sale, .badge-hot {
      font-size: 9px;
      padding: 1px 6px;
      border-radius: 3px;
    }
    .badge-sale { background: #e74c3c; }
    .badge-hot { background: #f39c12; }

    /* Dropdown */
    .has-dropdown { position: relative; }
    .dropdown {
      position: absolute;
      top: 100%;
      left: 0;
      background: #fff;
      min-width: 200px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
      border-radius: 0 0 8px 8px;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-10px);
      transition: all 0.3s ease;
      z-index: 300;
    }
    .has-dropdown:hover .dropdown {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
    .dropdown a {
      display: block;
      padding: 10px 18px;
      font-size: 13px;
      color: #444;
      border-bottom: 1px solid #f5f5f5;
      transition: all 0.2s;
    }
    .dropdown a:hover {
      background: var(--primary-light);
      color: var(--primary);
      padding-left: 24px;
    }

    /* Mega Menu */
    .mega-menu {
      position: absolute;
      top: 100%;
      left: 0;
      width: 100%;
      background: #fff;
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
      z-index: 300;
      display: none;
      padding: 20px;
    }
    .mega-menu.open { display: block; animation: fadeInUp 0.3s ease; }
    .mega-menu-columns {
      display: flex;
      gap: 30px;
    }
    .mega-col { flex: 1; }
    .mega-col h4 {
      font-size: 13px;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 10px;
      padding-bottom: 8px;
      border-bottom: 1px solid #f0f0f0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .mega-col ul { list-style: none; }
    .mega-col ul li { margin-bottom: 6px; }
    .mega-col ul li a {
      color: #555;
      font-size: 13px;
      transition: color 0.2s;
    }
    .mega-col ul li a:hover { color: var(--primary); }
    .mega-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.4);
      z-index: 199;
    }
    .mega-overlay.show { display: block; }

    @media (max-width: 768px) {
      .header-inner { flex-wrap: wrap; gap: 10px; }
      .search-bar { order: 3; max-width: 100%; }
      .top-bar { display: none; }
      .icon-label { display: none; }
    }

    /* ===== User Menu ===== */
    .user-menu-wrap { position: relative; display: flex; align-items: center; }
    .user-avatar-btn {
      display: flex; align-items: center; gap: 10px;
      background: none; border: none; cursor: pointer; padding: 6px 8px;
      border-radius: 10px; transition: background .2s;
    }
    .user-avatar-btn:hover { background: rgba(17,158,174,.08); }
    .user-avatar {
      width: 38px; height: 38px; border-radius: 50%;
      background: linear-gradient(135deg,#119EAE,#0d6e7e);
      color: #fff; font-size: 13px; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; box-shadow: 0 3px 10px rgba(17,158,174,.35);
    }
    .user-avatar-btn .icon-label { text-align: left; }
    .user-avatar-btn .icon-label strong { font-size: 13px; color: #1a1a2e; font-weight: 700; white-space: nowrap; max-width: 90px; overflow: hidden; text-overflow: ellipsis; display: block; }

    /* Dropdown */
    .user-dropdown {
      position: absolute; top: 100%; right: 0;
      padding-top: 8px;
      width: 230px; background: transparent;
      opacity: 0; transform: translateY(-8px) scale(.97);
      pointer-events: none; transition: all .25s cubic-bezier(.34,1.56,.64,1);
      z-index: 1000;
    }
    .user-dropdown .ud-inner-box {
      background: #fff; border-radius: 14px;
      box-shadow: 0 10px 40px rgba(0,0,0,.15);
      border: 1px solid rgba(0,0,0,.07); overflow: hidden;
    }
    .user-dropdown.open { opacity: 1; transform: translateY(0) scale(1); pointer-events: all; }
    .ud-header { display: flex; align-items: center; gap: 12px; padding: 16px; background: linear-gradient(135deg,#f0fafb,#e8f8fa); }
    .ud-avatar { width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(135deg,#119EAE,#0d6e7e); color: #fff; font-size: 14px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .ud-name { font-size: 13px; font-weight: 700; color: #1a1a2e; }
    .ud-email { font-size: 11px; color: #888; margin-top: 1px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px; }
    .ud-divider { height: 1px; background: #f3f3f3; margin: 4px 0; }
    .ud-item { display: flex; align-items: center; gap: 10px; padding: 11px 16px; font-size: 13px; color: #444; text-decoration: none; transition: all .2s; }
    .ud-item:hover { background: #f5feff; color: #119EAE; padding-left: 20px; }
    .ud-logout { width: 100%; padding: 11px 16px; background: none; border: none; text-align: left; font-size: 13px; color: #e74c3c; cursor: pointer; display: flex; align-items: center; gap: 10px; transition: background .2s; font-weight: 600; }
    .ud-logout:hover { background: #fff5f5; }

  `]
})
export class HeaderComponent implements OnInit {
  cartService = inject(CartService);
  authService = inject(AuthService);
  router = inject(Router);
  searchQuery = '';
  isSticky = false;
  showMegaMenu = false;
  userMenuOpen = false;

  ngOnInit() {
    window.addEventListener('scroll', () => {
      this.isSticky = window.scrollY > 150;
    });
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.showMegaMenu = false;
      this.router.navigate(['/shop'], { queryParams: { search: this.searchQuery.trim() } });
    }
  }

  toggleMegaMenu() {
    this.showMegaMenu = !this.showMegaMenu;
  }

  toggleUserMenu(event: MouseEvent) {
    event.stopPropagation();
    this.userMenuOpen = !this.userMenuOpen;
  }

  closeUserMenu() {
    this.userMenuOpen = false;
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.userMenuOpen = false;
  }

  logout() {
    this.authService.logout();
    this.userMenuOpen = false;
    this.router.navigate(['/']);
  }
}

