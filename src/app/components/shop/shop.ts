import { Component, OnInit, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { Product } from '../../services/product.service';
import { ProductCardComponent } from '../product-card/product-card';
import { environment } from '../../../environments/environment';

interface CategoryInfo { id: number; name: string; icon: string; color: string; count: number; slug: string; }
interface Pagination { page: number; limit: number; total: number; pages: number; }

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ProductCardComponent],
  template: `
    <!-- Page Banner -->
    <div class="page-banner">
      <div class="container">
        <h1>{{ selectedCategory ? selectedCategory : 'Shop All Products' }}</h1>
        <div class="breadcrumb">
          <a routerLink="/">Home</a><span>›</span>
          <span *ngIf="selectedCategory"><a routerLink="/shop">Shop</a></span>
          <span *ngIf="selectedCategory">›</span>
          <span>{{ selectedCategory || 'Shop' }}</span>
        </div>
      </div>
    </div>

    <div class="shop-wrap">
      <div class="shop-layout container">

        <!-- Sidebar Filters -->
        <aside class="shop-sidebar">
          <div class="filter-card">
            <h3 class="filter-title">🔍 Filter By</h3>

            <!-- Search -->
            <div class="filter-group">
              <h4>Search</h4>
              <div class="search-filter-wrap">
                <input type="text" [(ngModel)]="searchQuery" id="sidebar-search"
                  placeholder="Search 5,000 products..."
                  (input)="onSearchInput()" class="search-filter-input"/>
              </div>
            </div>

            <!-- Categories -->
            <div class="filter-group">
              <h4>Categories</h4>
              <div class="filter-list">
                <label class="filter-item" [class.active-cat]="selectedCategory === ''" (click)="filterByCategory('')">
                  <span>All Products</span>
                  <span class="filter-count">{{ totalItems }}</span>
                </label>
                <label class="filter-item" *ngFor="let cat of categoriesData"
                  [class.active-cat]="selectedCategory === cat.slug"
                  [id]="'cat-filter-' + cat.slug.replace(' ', '-')"
                  (click)="filterByCategory(cat.slug)">
                  <span>{{ cat.icon }} {{ cat.name }}</span>
                  <span class="filter-count">{{ cat.count }}</span>
                </label>
              </div>
            </div>

            <!-- Price Range -->
            <div class="filter-group">
              <h4>Price Range</h4>
              <div class="price-range">
                <div class="price-inputs">
                  <input type="number" [(ngModel)]="minPrice" id="min-price" placeholder="Min" (change)="reload()" class="price-inp"/>
                  <span>–</span>
                  <input type="number" [(ngModel)]="maxPrice" id="max-price" placeholder="Max" (change)="reload()" class="price-inp"/>
                </div>
                <input type="range" min="0" max="10000" step="50" [(ngModel)]="maxPrice"
                  id="price-range-slider" (input)="reload()" class="range-slider"/>
                <div class="price-labels">
                  <span>$0</span>
                  <span class="price-val">\${{ maxPrice.toLocaleString() }}</span>
                </div>
              </div>
            </div>

            <!-- In Stock -->
            <div class="filter-group">
              <label class="filter-item" style="cursor:pointer">
                <input type="checkbox" [(ngModel)]="inStockOnly" id="in-stock-filter" (change)="reload()"/>
                <span>In Stock Only</span>
              </label>
            </div>

            <button id="clear-filters-btn" class="clear-btn" (click)="clearFilters()">🗑 Clear All Filters</button>
          </div>
        </aside>

        <!-- Products Area -->
        <main class="shop-main">
          <!-- Active Filters -->
          <div class="active-filters" *ngIf="hasActiveFilters()">
            <span class="af-label">Active Filters:</span>
            <span class="af-tag" *ngIf="selectedCategory" (click)="filterByCategory('')">{{ selectedCategory }} ✕</span>
            <span class="af-tag" *ngIf="searchQuery" (click)="searchQuery=''; reload()">Search: "{{ searchQuery }}" ✕</span>
            <button class="af-clear" (click)="clearFilters()">Clear All</button>
          </div>

          <!-- Toolbar -->
          <div class="shop-toolbar">
            <div class="result-info">
              <span *ngIf="!loading">
                Showing <strong>{{ products.length }}</strong> of <strong>{{ totalItems.toLocaleString() }}</strong> products
                <span *ngIf="totalItems === 5000" class="live-badge">🟢 Live from MongoDB Atlas</span>
              </span>
              <span *ngIf="loading" class="loading-text">⏳ Loading from MongoDB...</span>
            </div>
            <div class="toolbar-right">
              <select [(ngModel)]="sortBy" id="sort-select" (change)="reload()" class="sort-select">
                <option value="id">Sort: Default</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Best Rating</option>
                <option value="discount">Biggest Discount</option>
                <option value="reviews">Most Reviewed</option>
                <option value="newest">Newest</option>
              </select>
              <div class="view-toggle">
                <button [class.active]="!listView" id="grid-view-btn" title="Grid" (click)="listView=false">⊞</button>
                <button [class.active]="listView"  id="list-view-btn" title="List" (click)="listView=true">☰</button>
              </div>
            </div>
          </div>

          <!-- Loading Spinner -->
          <div class="loading-state" *ngIf="loading">
            <div class="spinner"></div>
            <p>Fetching products from MongoDB Atlas...</p>
          </div>

          <!-- Products Grid -->
          <div [class]="listView ? 'products-list' : 'products-grid'" *ngIf="!loading && products.length > 0">
            <app-product-card *ngFor="let p of products" [product]="p" [listView]="listView"></app-product-card>
          </div>

          <!-- Pagination -->
          <div class="pagination" *ngIf="!loading && totalPages > 1">
            <button [disabled]="currentPage === 1" (click)="goPage(1)" id="first-page">«</button>
            <button [disabled]="currentPage === 1" (click)="goPage(currentPage - 1)" id="prev-page">← Prev</button>
            <button *ngFor="let p of pageNumbers" [class.active]="p === currentPage"
              (click)="goPage(p)" [id]="'page-' + p">{{ p }}</button>
            <button [disabled]="currentPage === totalPages" (click)="goPage(currentPage + 1)" id="next-page">Next →</button>
            <button [disabled]="currentPage === totalPages" (click)="goPage(totalPages)" id="last-page">»</button>
            <span class="page-info">Page {{ currentPage }} of {{ totalPages.toLocaleString() }}</span>
          </div>

          <!-- No Results -->
          <div class="no-results" *ngIf="!loading && products.length === 0">
            <div class="no-results-icon">🔍</div>
            <h3>No products found</h3>
            <p>Try adjusting your filters or search term.</p>
            <button (click)="clearFilters()" id="no-results-clear-btn" class="clear-btn-big">Clear Filters</button>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .page-banner { background: linear-gradient(135deg, #119EAE, #0d6e7e); padding: 40px 0; color: #fff; }
    .page-banner h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
    .breadcrumb { display: flex; align-items: center; gap: 8px; font-size: 13px; opacity: 0.85; }
    .breadcrumb a { color: #fff; }
    .shop-wrap { background: #f8f9fa; min-height: 70vh; padding: 25px 0 60px; }
    .shop-layout { display: grid; grid-template-columns: 270px 1fr; gap: 25px; }

    .filter-card { background: #fff; border-radius: 12px; padding: 22px; border: 1px solid #f0f0f0; position: sticky; top: 10px; max-height: 90vh; overflow-y: auto; }
    .filter-title { font-size: 16px; font-weight: 700; margin-bottom: 20px; color: #1a1a2e; }
    .filter-group { margin-bottom: 20px; border-bottom: 1px solid #f5f5f5; padding-bottom: 15px; }
    .filter-group h4 { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #888; margin-bottom: 10px; }
    .filter-list { display: flex; flex-direction: column; gap: 6px; }
    .filter-item { display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 13px; color: #555; padding: 5px 8px; border-radius: 6px; transition: all 0.2s; user-select: none; }
    .filter-item:hover { background: #f0f9fa; color: #119EAE; }
    .filter-item.active-cat { background: #e8f7f9; color: #119EAE; font-weight: 600; }
    .filter-item input { accent-color: #119EAE; }
    .filter-count { margin-left: auto; background: #f0f0f0; border-radius: 10px; padding: 1px 7px; font-size: 10px; color: #888; }
    .search-filter-wrap { position: relative; }
    .search-filter-input { width: 100%; padding: 9px 12px; border: 1px solid #e9ecef; border-radius: 8px; font-size: 13px; }
    .price-range { padding: 5px 0; }
    .price-inputs { display: flex; gap: 8px; align-items: center; margin-bottom: 10px; }
    .price-inp { border: 1px solid #e9ecef; padding: 7px 10px; border-radius: 6px; font-size: 13px; width: 80px; }
    .range-slider { width: 100%; accent-color: #119EAE; margin-bottom: 6px; }
    .price-labels { display: flex; justify-content: space-between; font-size: 12px; color: #777; }
    .price-val { font-weight: 700; color: #119EAE; }
    .clear-btn { width: 100%; background: transparent; border: 1px solid #e74c3c; color: #e74c3c; padding: 10px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; transition: all 0.3s; }
    .clear-btn:hover { background: #e74c3c; color: #fff; }
    .clear-btn-big { background: #119EAE; color: #fff; border: none; padding: 12px 28px; border-radius: 10px; font-weight: 700; cursor: pointer; font-size: 14px; margin-top: 10px; }

    .active-filters { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 15px; padding: 12px; background: #fff; border-radius: 10px; }
    .af-label { font-size: 12px; color: #888; font-weight: 600; }
    .af-tag { background: #e8f7f9; color: #119EAE; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1px solid #b8e6ee; transition: all 0.2s; }
    .af-tag:hover { background: #e74c3c; color: #fff; border-color: #e74c3c; }
    .af-clear { margin-left: auto; background: transparent; border: none; color: #e74c3c; font-size: 12px; cursor: pointer; font-weight: 600; }

    .shop-toolbar { display: flex; align-items: center; justify-content: space-between; background: #fff; border: 1px solid #f0f0f0; border-radius: 10px; padding: 12px 18px; margin-bottom: 20px; }
    .result-info { font-size: 14px; color: #666; }
    .result-info strong { color: #1a1a2e; }
    .live-badge { margin-left: 8px; font-size: 11px; background: #e8f7f9; color: #119EAE; padding: 3px 8px; border-radius: 10px; font-weight: 700; }
    .loading-text { color: #119EAE; font-style: italic; }
    .toolbar-right { display: flex; align-items: center; gap: 12px; }
    .sort-select { border: 1px solid #e9ecef; padding: 8px 14px; border-radius: 8px; font-size: 13px; color: #444; cursor: pointer; }
    .view-toggle { display: flex; border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden; }
    .view-toggle button { padding: 8px 14px; background: #fff; border: none; cursor: pointer; color: #aaa; font-size: 16px; transition: all 0.2s; }
    .view-toggle button.active, .view-toggle button:hover { background: #119EAE; color: #fff; }

    .loading-state { text-align: center; padding: 80px 20px; background: #fff; border-radius: 12px; }
    .spinner { width: 48px; height: 48px; border: 4px solid #e0f5f7; border-top-color: #119EAE; border-radius: 50%; animation: spin .8s linear infinite; margin: 0 auto 16px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .loading-state p { font-size: 14px; color: #888; }

    .products-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
    .products-list { display: flex; flex-direction: column; gap: 15px; }

    .pagination { display: flex; justify-content: center; align-items: center; gap: 6px; margin-top: 30px; flex-wrap: wrap; }
    .pagination button { padding: 8px 14px; border: 1px solid #e9ecef; background: #fff; border-radius: 8px; cursor: pointer; font-size: 14px; transition: all 0.2s; min-width: 40px; }
    .pagination button:hover { background: #119EAE; color: #fff; border-color: #119EAE; }
    .pagination button.active { background: #119EAE; color: #fff; border-color: #119EAE; font-weight: 700; }
    .pagination button:disabled { opacity: 0.4; cursor: not-allowed; }
    .page-info { font-size: 13px; color: #888; margin-left: 8px; }

    .no-results { text-align: center; padding: 60px 20px; background: #fff; border-radius: 12px; }
    .no-results-icon { font-size: 50px; margin-bottom: 15px; }

    @media (max-width: 1024px) { .shop-layout { grid-template-columns: 1fr; } .shop-sidebar { display: none; } .products-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 600px) { .products-grid { grid-template-columns: 1fr; } }
  `]
})
export class ShopComponent implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();
  private readonly API = environment.apiUrl;

  products: Product[] = [];
  categoriesData: CategoryInfo[] = [];
  loading = false;

  selectedCategory = '';
  minPrice = 0;
  maxPrice = 10000;
  sortBy = 'id';
  listView = false;
  searchQuery = '';
  inStockOnly = false;

  currentPage = 1;
  itemsPerPage = 24;
  totalPages = 1;
  totalItems = 0;
  pageNumbers: number[] = [];

  ngOnInit() {
    // Debounce search input — 400ms delay
    this.searchSubject.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => this.reload());

    // Load categories from Atlas
    this.http.get<any>(`${this.API}/products/categories`).subscribe(res => {
      this.categoriesData = res.categories || [];
    });

    // Read query params then load products
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      if (params['category']) this.selectedCategory = params['category'];
      if (params['search']) this.searchQuery = params['search'];
      if (params['sort']) this.sortBy = params['sort'];
      this.currentPage = 1;
      this.loadProducts();
    });
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }

  // ─── Load products from MongoDB Atlas API ───────────────────────────────────
  loadProducts() {
    this.loading = true;
    const params: any = {
      page: this.currentPage,
      limit: this.itemsPerPage,
      sort: this.sortBy
    };
    if (this.selectedCategory) params.category = this.selectedCategory;
    if (this.searchQuery) params.search = this.searchQuery;
    if (this.minPrice > 0) params.minPrice = this.minPrice;
    if (this.maxPrice < 10000) params.maxPrice = this.maxPrice;

    const qs = Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`).join('&');

    this.http.get<any>(`${this.API}/products?${qs}`).subscribe({
      next: (res) => {
        this.products = res.products || [];
        const pg: Pagination = res.pagination;
        this.totalItems = pg.total;
        this.totalPages = pg.pages;
        this.currentPage = pg.page;
        this.buildPageNumbers();
        this.loading = false;
        window.scrollTo({ top: 200, behavior: 'smooth' });
      },
      error: () => { this.loading = false; }
    });
  }

  reload() { this.currentPage = 1; this.loadProducts(); }

  onSearchInput() { this.searchSubject.next(this.searchQuery); }

  filterByCategory(cat: string) { this.selectedCategory = cat; this.reload(); }

  goPage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.currentPage = p;
    this.loadProducts();
  }

  buildPageNumbers() {
    const total = this.totalPages;
    const cur = this.currentPage;
    if (total <= 7) {
      this.pageNumbers = Array.from({ length: total }, (_, i) => i + 1);
    } else {
      const pages = new Set<number>([1, 2, cur - 1, cur, cur + 1, total - 1, total]);
      this.pageNumbers = [...pages].filter(p => p >= 1 && p <= total).sort((a, b) => a - b);
    }
  }

  clearFilters() {
    this.selectedCategory = '';
    this.minPrice = 0;
    this.maxPrice = 10000;
    this.inStockOnly = false;
    this.searchQuery = '';
    this.sortBy = 'id';
    this.currentPage = 1;
    this.loadProducts();
  }

  hasActiveFilters(): boolean {
    return !!(this.selectedCategory || this.searchQuery || this.minPrice > 0 || this.maxPrice < 10000 || this.inStockOnly);
  }
}
