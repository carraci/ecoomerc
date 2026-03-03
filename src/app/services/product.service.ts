import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, map, catchError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Product {
    id: number; name: string; brand: string; price: number; oldPrice: number;
    discount: number; rating: number; reviews: number; image: string;
    category: string; badge?: 'new' | 'hot' | 'sale' | null; inStock: boolean;
    description: string; features: string[]; colors?: string[];
}

export interface Category {
    id: number; name: string; icon: string; count: number; color: string; slug: string;
}

export interface ProductsResponse {
    products: Product[];
    pagination: { page: number; limit: number; total: number; pages: number };
}

@Injectable({ providedIn: 'root' })
export class ProductService {
    private http = inject(HttpClient);
    private base = environment.apiUrl;

    // ─── Products ──────────────────────────────────────────────────────────────

    getProducts(options: {
        page?: number; limit?: number; category?: string;
        sort?: string; search?: string; badge?: string;
        minPrice?: number; maxPrice?: number;
    } = {}): Observable<ProductsResponse> {
        let params = new HttpParams();
        if (options.page) params = params.set('page', String(options.page));
        if (options.limit) params = params.set('limit', String(options.limit));
        if (options.category) params = params.set('category', options.category);
        if (options.sort) params = params.set('sort', options.sort);
        if (options.search) params = params.set('search', options.search);
        if (options.badge) params = params.set('badge', options.badge);
        if (options.minPrice) params = params.set('minPrice', String(options.minPrice));
        if (options.maxPrice) params = params.set('maxPrice', String(options.maxPrice));

        return this.http.get<ProductsResponse>(`${this.base}/products`, { params }).pipe(
            catchError(err => {
                console.error('❌ Products API error:', err.message);
                return of({ products: [], pagination: { page: 1, limit: 24, total: 0, pages: 0 } });
            })
        );
    }

    getProductById(id: number): Observable<Product | undefined> {
        return this.http.get<{ product: Product }>(`${this.base}/products/${id}`).pipe(
            map(res => res.product),
            catchError(() => of(undefined))
        );
    }

    getProductsByCategory(category: string): Observable<Product[]> {
        return this.getProducts({ category, limit: 100 }).pipe(
            map(res => res.products)
        );
    }

    getFeaturedProducts(limit = 8): Observable<Product[]> {
        return this.http.get<{ products: Product[] }>(`${this.base}/products/featured?limit=${limit}`).pipe(
            map(res => res.products),
            catchError(() => of([]))
        );
    }

    getLatestProducts(limit = 6): Observable<Product[]> {
        return this.http.get<{ products: Product[] }>(`${this.base}/products/latest?limit=${limit}`).pipe(
            map(res => res.products),
            catchError(() => of([]))
        );
    }

    getDealProducts(limit = 12): Observable<Product[]> {
        return this.http.get<{ products: Product[] }>(`${this.base}/products/deals?limit=${limit}`).pipe(
            map(res => res.products),
            catchError(() => of([]))
        );
    }

    getCategories(): Observable<Category[]> {
        return this.http.get<{ categories: Category[] }>(`${this.base}/products/categories`).pipe(
            map(res => res.categories),
            catchError(() => of([]))
        );
    }

    getRelatedProducts(id: number, _category?: string): Observable<Product[]> {
        return this.http.get<{ products: Product[] }>(`${this.base}/products/${id}/related`).pipe(
            map(res => res.products),
            catchError(() => of([]))
        );
    }

    searchProducts(query: string): Observable<Product[]> {
        return this.getProducts({ search: query, limit: 50 }).pipe(
            map(res => res.products)
        );
    }

    getProductsByTab(tab: string): Observable<Product[]> {
        const tabMap: { [k: string]: string } = {
            'Electronics': 'Laptops',
            'Gadgets': 'Headphones',
            'Smart Devices': 'Phones'
        };
        const category = tabMap[tab];
        if (!category) return of([]);
        return this.getProductsByCategory(category);
    }
}
