import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { ShopComponent } from './components/shop/shop';
import { CartComponent } from './components/cart/cart';
import { ProductDetailComponent } from './components/product-detail/product-detail';
import { AuthComponent } from './components/auth/auth';
import { OrdersComponent } from './components/orders/orders';
import { WishlistComponent } from './components/wishlist/wishlist';
import { ProfileComponent } from './components/profile/profile';
import { CheckoutComponent } from './components/checkout/checkout';

export const routes: Routes = [
    { path: '', component: HomeComponent, title: 'Electshop - Electronics & Digital Store' },
    { path: 'shop', component: ShopComponent, title: 'Shop All Products - Electshop' },
    { path: 'product/:id', component: ProductDetailComponent, title: 'Product Detail - Electshop' },
    { path: 'cart', component: CartComponent, title: 'Shopping Cart - Electshop' },
    { path: 'login', component: AuthComponent, title: 'Sign In - Electshop' },
    { path: 'signup', component: AuthComponent, title: 'Create Account - Electshop' },
    { path: 'forgot-password', component: AuthComponent, title: 'Forgot Password - Electshop' },
    { path: 'orders', component: OrdersComponent, title: 'My Orders - Electshop' },
    { path: 'wishlist', component: WishlistComponent, title: 'My Wishlist - Electshop' },
    { path: 'profile', component: ProfileComponent, title: 'My Profile - Electshop' },
    { path: 'checkout', component: CheckoutComponent, title: 'Checkout - Electshop' },
    { path: '**', redirectTo: '' }
];
