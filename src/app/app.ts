import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header';
import { FooterComponent } from './components/footer/footer';
import { AuthService } from './services/auth.service';
import { CartService } from './services/cart.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <app-header></app-header>
    <main>
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
  `,
  styles: [`main { min-height: 60vh; }`]
})
export class App implements OnInit {
  private authService = inject(AuthService);
  private cartService = inject(CartService);
  title = 'Electshop - Electronics & Digital Store';

  ngOnInit() {
    // Step 1: Restore persisted login session from localStorage
    this.authService.restoreSession();

    // Step 2: If user was already logged in, load their cart from MongoDB Atlas
    if (this.authService.isLoggedIn()) {
      this.cartService.loadFromAtlas();
    }
  }
}
