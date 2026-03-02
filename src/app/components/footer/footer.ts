import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-footer',
    standalone: true,
    imports: [CommonModule],
    template: `
    <!-- Newsletter Section -->
    <section class="newsletter-section">
      <div class="container">
        <div class="newsletter-inner">
          <div class="newsletter-left">
            <h3>📧 Subscribe to Our Newsletter</h3>
            <p>Get the latest deals, new arrivals and exclusive offers delivered to your inbox.</p>
          </div>
          <div class="newsletter-form">
            <input type="email" id="newsletter-email" placeholder="Enter your email address..." />
            <button id="newsletter-btn">SUBSCRIBE</button>
          </div>
        </div>
        <label class="gdpr-check">
          <input type="checkbox" id="gdpr-checkbox" /> I agree to the <a href="#">Privacy Policy</a> and consent to receive marketing emails.
        </label>
      </div>
    </section>

    <!-- Main Footer -->
    <footer class="main-footer">
      <div class="container">
        <div class="footer-grid">
          <!-- Col 1: Info -->
          <div class="footer-col">
            <div class="footer-logo">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="#119EAE"/>
                <path d="M8 10h16M8 16h10M8 22h16" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
              </svg>
              <span>Elect<strong>shop</strong></span>
            </div>
            <p class="footer-desc">Your one-stop destination for premium electronics and gadgets. Shop the latest tech at unbeatable prices.</p>
            <div class="app-buttons">
              <a href="#" id="app-store-btn" class="app-btn">
                <span class="app-icon">🍎</span>
                <div>
                  <small>Download on the</small>
                  <strong>App Store</strong>
                </div>
              </a>
              <a href="#" id="play-store-btn" class="app-btn">
                <span class="app-icon">▶</span>
                <div>
                  <small>Get it on</small>
                  <strong>Google Play</strong>
                </div>
              </a>
            </div>
          </div>

          <!-- Col 2: Products -->
          <div class="footer-col">
            <h4>Products</h4>
            <ul>
              <li><a href="#" id="footer-new-arrivals">New Arrivals</a></li>
              <li><a href="#" id="footer-bestsellers">Best Sellers</a></li>
              <li><a href="#" id="footer-featured">Featured Products</a></li>
              <li><a href="#" id="footer-sale">Sale Items</a></li>
              <li><a href="#" id="footer-deals">Daily Deals</a></li>
              <li><a href="#" id="footer-bundle">Bundle Deals</a></li>
            </ul>
          </div>

          <!-- Col 3: Company -->
          <div class="footer-col">
            <h4>Our Company</h4>
            <ul>
              <li><a href="#" id="footer-about">About Us</a></li>
              <li><a href="#" id="footer-careers">Careers</a></li>
              <li><a href="#" id="footer-press">Press</a></li>
              <li><a href="#" id="footer-sustainability">Sustainability</a></li>
              <li><a href="#" id="footer-partners">Partners</a></li>
              <li><a href="#" id="footer-affiliates">Affiliates</a></li>
            </ul>
          </div>

          <!-- Col 4: Account -->
          <div class="footer-col">
            <h4>Your Account</h4>
            <ul>
              <li><a href="#" id="footer-orders">My Orders</a></li>
              <li><a href="#" id="footer-wishlist">Wishlist</a></li>
              <li><a href="#" id="footer-returns">Returns</a></li>
              <li><a href="#" id="footer-shipping">Shipping Info</a></li>
              <li><a href="#" id="footer-faq">FAQ</a></li>
              <li><a href="#" id="footer-support">Support</a></li>
            </ul>
          </div>

          <!-- Col 5: Contact -->
          <div class="footer-col">
            <h4>Contact Us</h4>
            <div class="contact-item">
              <span>📍</span>
              <p>123 Tech Street, Silicon Valley, CA 94025, USA</p>
            </div>
            <div class="contact-item">
              <span>📞</span>
              <p>+1 (800) 555-ELECT</p>
            </div>
            <div class="contact-item">
              <span>✉️</span>
              <p>support&#64;electshop.com</p>
            </div>
            <div class="work-hours">
              <strong>Working Hours:</strong>
              <p>Mon–Fri: 9am–6pm EST</p>
            </div>
          </div>
        </div>
      </div>
    </footer>

    <!-- Bottom Bar -->
    <div class="footer-bottom">
      <div class="container footer-bottom-inner">
        <p>© 2024 <strong>Electshop</strong>. All rights reserved. Built with ❤️ using Angular.</p>
        <div class="social-icons">
          <a href="#" id="social-facebook" aria-label="Facebook">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
          </a>
          <a href="#" id="social-twitter" aria-label="Twitter">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>
          </a>
          <a href="#" id="social-instagram" aria-label="Instagram">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
          </a>
          <a href="#" id="social-youtube" aria-label="YouTube">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.41 19.1C5.12 19.56 12 19.56 12 19.56s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.38z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="white"/></svg>
          </a>
        </div>
        <div class="payment-methods">
          <span>💳</span>
          <span>🏦</span>
          <span>📱</span>
          <span class="payment-text">Visa · Mastercard · PayPal · Apple Pay</span>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .newsletter-section {
      background: linear-gradient(135deg, #119EAE, #0d849a);
      padding: 40px 0;
      color: #fff;
    }
    .newsletter-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 30px;
      margin-bottom: 15px;
    }
    .newsletter-left h3 { font-size: 20px; font-weight: 700; margin-bottom: 5px; }
    .newsletter-left p { opacity: 0.85; font-size: 14px; }
    .newsletter-form {
      display: flex;
      gap: 0;
      flex: 0 0 450px;
    }
    .newsletter-form input {
      flex: 1;
      padding: 13px 18px;
      border: none;
      border-radius: 8px 0 0 8px;
      font-size: 14px;
    }
    .newsletter-form button {
      background: #1a1a2e;
      color: #fff;
      padding: 13px 24px;
      border: none;
      border-radius: 0 8px 8px 0;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      letter-spacing: 0.5px;
      transition: background 0.3s;
    }
    .newsletter-form button:hover { background: #000; }
    .gdpr-check {
      font-size: 12px;
      opacity: 0.8;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }
    .gdpr-check a { color: #fff; text-decoration: underline; }

    .main-footer {
      background: #1a1a1a;
      padding: 60px 0 30px;
      color: #ccc;
    }
    .footer-grid {
      display: grid;
      grid-template-columns: 1.5fr 1fr 1fr 1fr 1.2fr;
      gap: 40px;
    }
    .footer-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 15px;
      font-size: 20px;
      color: #fff;
      font-family: 'Poppins', sans-serif;
    }
    .footer-logo strong { color: #119EAE; }
    .footer-desc {
      font-size: 13px;
      line-height: 1.8;
      margin-bottom: 20px;
      opacity: 0.75;
    }
    .app-buttons { display: flex; gap: 10px; flex-direction: column; }
    .app-btn {
      display: flex;
      align-items: center;
      gap: 10px;
      background: #2d2d2d;
      border: 1px solid #3a3a3a;
      border-radius: 8px;
      padding: 10px 14px;
      color: #fff;
      text-decoration: none;
      transition: all 0.3s;
    }
    .app-btn:hover { background: #119EAE; border-color: #119EAE; }
    .app-icon { font-size: 20px; }
    .app-btn div small { display: block; font-size: 10px; opacity: 0.7; }
    .app-btn div strong { font-size: 13px; }

    .footer-col h4 {
      color: #fff;
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 2px solid #119EAE;
      display: inline-block;
    }
    .footer-col ul { list-style: none; }
    .footer-col ul li { margin-bottom: 8px; }
    .footer-col ul li a {
      color: #aaa;
      font-size: 13px;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .footer-col ul li a::before {
      content: '›';
      color: #119EAE;
      font-weight: 700;
    }
    .footer-col ul li a:hover { color: #119EAE; padding-left: 5px; }
    .contact-item {
      display: flex;
      gap: 10px;
      margin-bottom: 12px;
      font-size: 13px;
      color: #aaa;
    }
    .work-hours { margin-top: 15px; font-size: 13px; color: #aaa; }
    .work-hours strong { color: #fff; }

    .footer-bottom {
      background: #111;
      padding: 16px 0;
    }
    .footer-bottom-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 15px;
    }
    .footer-bottom p { color: #777; font-size: 12px; }
    .footer-bottom strong { color: #119EAE; }
    .social-icons { display: flex; gap: 10px; }
    .social-icons a {
      width: 32px;
      height: 32px;
      background: #2a2a2a;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #aaa;
      transition: all 0.3s;
    }
    .social-icons a:hover { background: #119EAE; color: #fff; transform: translateY(-2px); }
    .payment-methods { display: flex; align-items: center; gap: 8px; color: #777; font-size: 11px; }
    .payment-text { color: #666; font-size: 11px; }

    @media (max-width: 1024px) {
      .footer-grid { grid-template-columns: 1fr 1fr 1fr; }
    }
    @media (max-width: 768px) {
      .footer-grid { grid-template-columns: 1fr 1fr; }
      .newsletter-inner { flex-direction: column; }
      .newsletter-form { flex: none; width: 100%; }
    }
  `]
})
export class FooterComponent { }
