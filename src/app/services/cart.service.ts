import { Injectable, signal, computed, inject } from '@angular/core';
import { Product } from './product.service';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

export interface CartItem {
    product: Product;
    quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
    private api = inject(ApiService);
    private auth = inject(AuthService);

    private cartItems = signal<CartItem[]>([]);

    items = this.cartItems.asReadonly();
    count = computed(() => this.cartItems().reduce((sum, item) => sum + item.quantity, 0));
    total = computed(() => this.cartItems().reduce((sum, item) => sum + item.product.price * item.quantity, 0));

    // ─── Convert CartItems → MongoDB-ready payload ──────────────────────────────
    private toPayload(items: CartItem[]) {
        return items.map(i => ({
            productId: String(i.product.id),
            name: i.product.name,
            brand: i.product.brand || '',
            image: i.product.image || '',
            price: i.product.price,
            quantity: i.quantity
        }));
    }

    // ─── Sync current cart to MongoDB Atlas (called after every change) ─────────
    private syncToAtlas() {
        const token = this.auth.token();
        if (!token) return;          // guest user — no sync
        this.api.saveCart(token, this.toPayload(this.cartItems())).subscribe({
            next: () => console.log('🛒 Cart synced to MongoDB Atlas'),
            error: (e) => console.warn('⚠️ Cart sync failed:', e.message)
        });
    }

    // ─── Load cart from MongoDB Atlas on login ──────────────────────────────────
    loadFromAtlas() {
        const token = this.auth.token();
        if (!token) return;
        this.api.getCart(token).subscribe({
            next: (res: any) => {
                const dbItems: any[] = res?.cart?.items || [];
                if (!dbItems.length) return;

                // Rebuild CartItem[] from DB data using all required Product fields
                const restored: CartItem[] = dbItems.map((i: any) => ({
                    product: {
                        id: Number(i.productId) || 0,
                        name: i.name,
                        brand: i.brand || '',
                        image: i.image || '',
                        price: i.price || 0,
                        oldPrice: i.price || 0,
                        discount: 0,
                        rating: 0,
                        reviews: 0,
                        category: '',
                        description: '',
                        features: [],
                        inStock: true
                    } as Product,
                    quantity: i.quantity
                }));
                this.cartItems.set(restored);
                console.log(`✅ Cart restored from MongoDB Atlas (${restored.length} items)`);
            },
            error: (e) => console.warn('⚠️ Could not load cart from Atlas:', e.message)
        });
    }

    // ─── Add to Cart ────────────────────────────────────────────────────────────
    addToCart(product: Product, quantity: number = 1) {
        const current = this.cartItems();
        const existing = current.find(item => item.product.id === product.id);
        if (existing) {
            this.cartItems.set(current.map(item =>
                item.product.id === product.id
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
            ));
        } else {
            this.cartItems.set([...current, { product, quantity }]);
        }
        this.syncToAtlas();   // ← save to MongoDB
    }

    // ─── Remove from Cart ────────────────────────────────────────────────────────
    removeFromCart(productId: number) {
        this.cartItems.set(this.cartItems().filter(item => item.product.id !== productId));
        this.syncToAtlas();   // ← save to MongoDB
    }

    // ─── Update Quantity ────────────────────────────────────────────────────────
    updateQuantity(productId: number, quantity: number) {
        if (quantity < 1) {
            this.removeFromCart(productId);
            return;
        }
        this.cartItems.set(this.cartItems().map(item =>
            item.product.id === productId ? { ...item, quantity } : item
        ));
        this.syncToAtlas();   // ← save to MongoDB
    }

    // ─── Clear Cart ─────────────────────────────────────────────────────────────
    clearCart() {
        this.cartItems.set([]);
        const token = this.auth.token();
        if (token) {
            this.api.clearCart(token).subscribe({
                next: () => console.log('🗑️ Cart cleared in MongoDB Atlas'),
                error: (e) => console.warn('⚠️ Cart clear failed:', e.message)
            });
        }
    }
}
