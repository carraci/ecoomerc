import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { CartService } from '../../services/cart.service';

type AuthView = 'login' | 'signup' | 'forgot';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
<div class="auth-root">

  <!-- Animated background -->
  <div class="auth-backdrop">
    <div class="orb orb1"></div>
    <div class="orb orb2"></div>
    <div class="orb orb3"></div>
    <div class="grid-lines"></div>
  </div>

  <div class="auth-wrap">

    <!-- LEFT brand column -->
    <div class="left-col">
      <a routerLink="/" class="brand">
        <div class="brand-box">
          <svg width="22" height="22" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="8" fill="white" fill-opacity=".15"/><path d="M8 10h16M8 16h10M8 22h16" stroke="white" stroke-width="2.5" stroke-linecap="round"/></svg>
        </div>
        <span class="brand-name">Elect<strong>shop</strong></span>
      </a>

      <div class="left-body">
        <div class="left-tag">⚡ Premium Electronics Store</div>
        <h2 class="left-headline" *ngIf="view==='login'">Sign in &amp;<br>Shop Smarter</h2>
        <h2 class="left-headline" *ngIf="view==='signup'">Create Your<br>Free Account</h2>
        <h2 class="left-headline" *ngIf="view==='forgot'">Recover Your<br>Password</h2>
        <p class="left-sub">Access exclusive deals, track orders, and enjoy a seamless premium shopping experience.</p>

        <div class="trust-cards">
          <div class="trust-card" *ngFor="let t of trusts">
            <span class="tc-icon">{{t.icon}}</span>
            <div><strong>{{t.title}}</strong><span>{{t.desc}}</span></div>
          </div>
        </div>
      </div>

      <div class="left-stat-row">
        <div class="stat" *ngFor="let s of stats">
          <strong>{{s.val}}</strong><span>{{s.label}}</span>
        </div>
      </div>
    </div>

    <!-- RIGHT form column -->
    <div class="right-col">
      <div class="form-card">

        <!-- view tabs -->
        <div class="view-tabs">
          <button [class.active]="view==='login'" (click)="switchTo('login')" id="tab-login">Sign In</button>
          <button [class.active]="view==='signup'" (click)="switchTo('signup')" id="tab-signup">Register</button>
        </div>

        <!-- notification -->
        <div class="notif" [class.notif-ok]="notif.type==='success'" [class.notif-err]="notif.type==='error'" *ngIf="notif.show">
          <span>{{notif.type==='success' ? '✓' : '✗'}}</span> {{notif.msg}}
        </div>

        <!-- ===== LOGIN ===== -->
        <div *ngIf="view==='login'">
          <p class="form-sub">Welcome back! Please sign in to continue.</p>

          <div class="social-btns">
            <button class="s-btn" id="btn-google" (click)="socialLogin('Google')">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#EA4335" d="M5.27 9.76A7.08 7.08 0 0 1 19.07 12c0 .68-.06 1.34-.18 1.97H12v-3.73h7.49c.15.77.23 1.58.23 2.42 0 4.01-2.72 6.95-6.72 6.95a7.08 7.08 0 0 1 0-14.15c1.92 0 3.65.76 4.93 2l-2.04 2.04A4.28 4.28 0 0 0 12 4.85a4.23 4.23 0 0 0-6.73 4.91z"/></svg>
              Google
            </button>
            <button class="s-btn s-fb" id="btn-facebook" (click)="socialLogin('Facebook')">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.27h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z"/></svg>
              Facebook
            </button>
          </div>

          <div class="sep"><span>or continue with email</span></div>

          <form (ngSubmit)="onLogin()">
            <div class="field" [class.err]="e.email">
              <label>Email Address</label>
              <div class="inp-wrap">
                <svg class="inp-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input type="email" id="login-email" [(ngModel)]="ld.email" name="lemail" placeholder="you@example.com" (blur)="valEmail()" />
              </div>
              <span class="err-txt" *ngIf="e.email">{{e.email}}</span>
            </div>

            <div class="field" [class.err]="e.pass">
              <div class="field-top"><label>Password</label><a class="link-sm" (click)="switchTo('forgot')" id="link-forgot">Forgot password?</a></div>
              <div class="inp-wrap">
                <svg class="inp-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input [type]="sp1?'text':'password'" id="login-pass" [(ngModel)]="ld.pass" name="lpass" placeholder="Enter password" (blur)="valPass()" />
                <button type="button" class="eye" (click)="sp1=!sp1">{{sp1?'🙈':'👁️'}}</button>
              </div>
              <span class="err-txt" *ngIf="e.pass">{{e.pass}}</span>
            </div>

            <label class="check-row">
              <input type="checkbox" [(ngModel)]="ld.rem" name="lrem" id="remember-me"/>
              <span class="check-box"></span>
              <span>Keep me signed in for 30 days</span>
            </label>

            <button type="submit" class="btn-main" id="btn-login" [disabled]="loading">
              <span class="spin" *ngIf="loading"></span>
              <svg *ngIf="!loading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              {{loading ? 'Signing in...' : 'Sign In'}}
            </button>
          </form>

          <p class="bottom-link">No account? <a (click)="switchTo('signup')" id="link-to-signup">Create one free →</a></p>
        </div>

        <!-- ===== SIGNUP ===== -->
        <div *ngIf="view==='signup'">
          <p class="form-sub">Join thousands of happy shoppers today.</p>

          <div class="social-btns">
            <button class="s-btn" id="btn-google-up" (click)="socialLogin('Google')">
              <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#EA4335" d="M5.27 9.76A7.08 7.08 0 0 1 19.07 12c0 .68-.06 1.34-.18 1.97H12v-3.73h7.49c.15.77.23 1.58.23 2.42 0 4.01-2.72 6.95-6.72 6.95a7.08 7.08 0 0 1 0-14.15c1.92 0 3.65.76 4.93 2l-2.04 2.04A4.28 4.28 0 0 0 12 4.85a4.23 4.23 0 0 0-6.73 4.91z"/></svg>
              Sign up with Google
            </button>
          </div>

          <div class="sep"><span>or fill in your details</span></div>

          <form (ngSubmit)="onSignup()">
            <div class="row2">
              <div class="field">
                <label>First Name</label>
                <div class="inp-wrap">
                  <svg class="inp-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <input type="text" id="signup-fname" [(ngModel)]="sd.fn" name="sfn" placeholder="John" />
                </div>
              </div>
              <div class="field">
                <label>Last Name</label>
                <div class="inp-wrap">
                  <svg class="inp-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <input type="text" id="signup-lname" [(ngModel)]="sd.ln" name="sln" placeholder="Doe" />
                </div>
              </div>
            </div>

            <div class="field">
              <label>Email Address</label>
              <div class="inp-wrap">
                <svg class="inp-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input type="email" id="signup-email" [(ngModel)]="sd.email" name="semail" placeholder="you@example.com" />
              </div>
            </div>

            <div class="field">
              <label>Password</label>
              <div class="inp-wrap">
                <svg class="inp-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input [type]="sp2?'text':'password'" id="signup-pass" [(ngModel)]="sd.pass" name="spass" placeholder="Min. 8 characters" (input)="calcStrength()" />
                <button type="button" class="eye" (click)="sp2=!sp2">{{sp2?'🙈':'👁️'}}</button>
              </div>
              <div class="strength-row" *ngIf="sd.pass">
                <div class="strength-track"><div class="strength-bar" [style.width]="str.pct+'%'" [class]="str.cls"></div></div>
                <span class="str-label" [class]="str.cls">{{str.label}}</span>
              </div>
            </div>

            <div class="field">
              <label>Confirm Password</label>
              <div class="inp-wrap">
                <svg class="inp-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input [type]="sp3?'text':'password'" id="signup-confirm" [(ngModel)]="sd.confirm" name="sconfirm" placeholder="Re-enter password" />
                <button type="button" class="eye" (click)="sp3=!sp3">{{sp3?'🙈':'👁️'}}</button>
              </div>
            </div>

            <label class="check-row">
              <input type="checkbox" [(ngModel)]="sd.terms" name="sterms" id="agree-terms"/>
              <span class="check-box"></span>
              <span>I agree to the <a href="#" class="link-sm">Terms</a> &amp; <a href="#" class="link-sm">Privacy Policy</a></span>
            </label>

            <button type="submit" class="btn-main" id="btn-signup" [disabled]="loading">
              <span class="spin" *ngIf="loading"></span>
              <svg *ngIf="!loading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
              {{loading ? 'Creating account...' : 'Create Free Account'}}
            </button>
          </form>

          <p class="bottom-link">Already a member? <a (click)="switchTo('login')" id="link-to-login">Sign in →</a></p>
        </div>

        <!-- ===== FORGOT ===== -->
        <div *ngIf="view==='forgot'">
          <div class="forgot-hero">
            <div class="fh-icon">🔑</div>
            <h3>Reset your password</h3>
            <p>Enter your email and we'll send a secure reset link instantly.</p>
          </div>

          <form (ngSubmit)="onForgot()" *ngIf="!resetDone">
            <div class="field">
              <label>Registered Email</label>
              <div class="inp-wrap">
                <svg class="inp-ico" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                <input type="email" id="forgot-email" [(ngModel)]="fe" name="fe" placeholder="you@example.com" />
              </div>
            </div>
            <button type="submit" class="btn-main" id="btn-forgot" [disabled]="loading">
              <span class="spin" *ngIf="loading"></span>
              📧 {{loading ? 'Sending...' : 'Send Reset Link'}}
            </button>
          </form>

          <div class="reset-ok" *ngIf="resetDone">
            <div class="rok-icon">📬</div>
            <h4>Email Sent!</h4>
            <p>We've sent a link to <strong>{{fe}}</strong>. Check your inbox.</p>
            <div class="rok-btns">
              <button class="btn-outline" id="btn-resend" (click)="onForgot()">Resend</button>
              <button class="btn-main" id="btn-back-login" (click)="switchTo('login')">Back to Login</button>
            </div>
          </div>

          <p class="bottom-link"><a (click)="switchTo('login')" id="link-back-login">← Back to Sign In</a></p>
        </div>

        <!-- Security badges -->
        <div class="sec-badges">
          <span>🔒 SSL Encrypted</span>
          <span>🛡️ GDPR Safe</span>
          <span>✅ Verified Store</span>
        </div>
      </div>
    </div>

  </div>
</div>
  `,
  styles: [`
    *{box-sizing:border-box;margin:0;padding:0}
    .auth-root{min-height:100vh;display:flex;font-family:'Inter','Segoe UI',sans-serif;position:relative;overflow:hidden;background:#060c1a}

    /* ===Animated BG=== */
    .auth-backdrop{position:fixed;inset:0;z-index:0;overflow:hidden}
    .grid-lines{position:absolute;inset:0;background-image:linear-gradient(rgba(17,158,174,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(17,158,174,.06) 1px,transparent 1px);background-size:50px 50px}
    .orb{position:absolute;border-radius:50%;filter:blur(80px);opacity:.35;animation:drift 12s ease-in-out infinite}
    .orb1{width:500px;height:500px;background:radial-gradient(circle,#119EAE,transparent);top:-150px;left:-150px;animation-duration:14s}
    .orb2{width:400px;height:400px;background:radial-gradient(circle,#5b21b6,transparent);bottom:-100px;right:-100px;animation-duration:11s;animation-delay:-4s}
    .orb3{width:300px;height:300px;background:radial-gradient(circle,#0d849a,transparent);top:40%;left:35%;animation-duration:9s;animation-delay:-7s}
    @keyframes drift{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(30px,-20px) scale(1.05)}66%{transform:translate(-20px,30px) scale(.95)}}

    /* ===Layout=== */
    .auth-wrap{position:relative;z-index:1;display:grid;grid-template-columns:1fr 1fr;min-height:100vh;width:100%;max-width:1200px;margin:0 auto}

    /* ===LEFT=== */
    .left-col{display:flex;flex-direction:column;padding:48px 44px;color:#fff}
    .brand{display:flex;align-items:center;gap:12px;text-decoration:none;margin-bottom:auto}
    .brand-box{width:42px;height:42px;background:rgba(17,158,174,.25);border:1px solid rgba(17,158,174,.4);border-radius:10px;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px)}
    .brand-name{font-size:22px;font-weight:300;color:#fff;letter-spacing:-.3px}.brand-name strong{font-weight:800;color:#119EAE}
    .left-body{flex:1;display:flex;flex-direction:column;justify-content:center;padding:40px 0}
    .left-tag{display:inline-flex;align-items:center;gap:6px;background:rgba(17,158,174,.15);border:1px solid rgba(17,158,174,.3);color:#5ee;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:6px 14px;border-radius:20px;margin-bottom:20px;width:fit-content}
    .left-headline{font-size:clamp(32px,4vw,48px);font-weight:900;line-height:1.1;letter-spacing:-1.5px;margin-bottom:16px;background:linear-gradient(135deg,#fff 40%,#119EAE);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
    .left-sub{font-size:15px;color:rgba(255,255,255,.6);line-height:1.8;margin-bottom:40px;max-width:380px}
    .trust-cards{display:flex;flex-direction:column;gap:10px}
    .trust-card{display:flex;align-items:center;gap:14px;padding:14px 18px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;backdrop-filter:blur(10px);transition:all .3s}
    .trust-card:hover{background:rgba(17,158,174,.1);border-color:rgba(17,158,174,.3);transform:translateX(4px)}
    .tc-icon{font-size:22px;width:36px;text-align:center;flex-shrink:0}
    .trust-card div{display:flex;flex-direction:column;gap:1px}
    .trust-card strong{font-size:13px;color:#fff;font-weight:600}
    .trust-card span{font-size:11px;color:rgba(255,255,255,.5)}
    .left-stat-row{display:flex;gap:30px;padding-top:30px;border-top:1px solid rgba(255,255,255,.08);margin-top:30px}
    .stat{display:flex;flex-direction:column;gap:2px}
    .stat strong{font-size:22px;font-weight:800;color:#119EAE}
    .stat span{font-size:11px;color:rgba(255,255,255,.5);text-transform:uppercase;letter-spacing:.5px}

    /* ===RIGHT=== */
    .right-col{display:flex;align-items:center;justify-content:center;padding:40px 32px}
    .form-card{width:100%;max-width:460px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.1);border-radius:24px;padding:36px;backdrop-filter:blur(20px);box-shadow:0 25px 80px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.1)}

    /* tabs */
    .view-tabs{display:flex;background:rgba(255,255,255,.06);border-radius:12px;padding:4px;margin-bottom:28px;gap:4px}
    .view-tabs button{flex:1;padding:10px;border:none;background:transparent;color:rgba(255,255,255,.5);font-size:13px;font-weight:600;border-radius:9px;cursor:pointer;transition:all .3s}
    .view-tabs button.active{background:linear-gradient(135deg,#119EAE,#0d849a);color:#fff;box-shadow:0 4px 15px rgba(17,158,174,.4)}

    /* notification */
    .notif{padding:12px 16px;border-radius:10px;font-size:13px;font-weight:600;margin-bottom:20px;display:flex;align-items:center;gap:8px}
    .notif-ok{background:rgba(39,174,96,.15);border:1px solid rgba(39,174,96,.3);color:#2ecc71}
    .notif-err{background:rgba(231,76,60,.15);border:1px solid rgba(231,76,60,.3);color:#e74c3c}

    .form-sub{font-size:13px;color:rgba(255,255,255,.5);margin-bottom:22px}

    /* social */
    .social-btns{display:flex;gap:10px;margin-bottom:20px}
    .s-btn{flex:1;display:flex;align-items:center;justify-content:center;gap:8px;padding:11px 14px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:10px;color:#fff;font-size:13px;font-weight:600;cursor:pointer;transition:all .3s}
    .s-btn:hover{background:rgba(255,255,255,.12);border-color:rgba(17,158,174,.5);transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,.3)}
    .s-fb{background:rgba(24,119,242,.15);border-color:rgba(24,119,242,.3)}

    /* sep */
    .sep{display:flex;align-items:center;gap:12px;margin:18px 0;font-size:11px;color:rgba(255,255,255,.3)}
    .sep::before,.sep::after{content:'';flex:1;height:1px;background:rgba(255,255,255,.08)}

    /* fields */
    .field{margin-bottom:16px}
    .field-top{display:flex;justify-content:space-between;align-items:center}
    label{display:block;font-size:12px;font-weight:600;color:rgba(255,255,255,.55);margin-bottom:6px;letter-spacing:.3px;text-transform:uppercase}
    .inp-wrap{position:relative;display:flex;align-items:center}
    .inp-ico{position:absolute;left:14px;color:rgba(255,255,255,.3);flex-shrink:0;pointer-events:none}
    .inp-wrap input{width:100%;padding:13px 42px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:10px;color:#fff;font-size:14px;transition:all .3s;outline:none}
    .inp-wrap input::placeholder{color:rgba(255,255,255,.25)}
    .inp-wrap input:focus{background:rgba(17,158,174,.08);border-color:#119EAE;box-shadow:0 0 0 3px rgba(17,158,174,.15)}
    .field.err .inp-wrap input{border-color:#e74c3c;box-shadow:0 0 0 3px rgba(231,76,60,.1)}
    .err-txt{font-size:11px;color:#e74c3c;margin-top:4px;display:block}
    .eye{position:absolute;right:12px;background:none;border:none;color:rgba(255,255,255,.4);cursor:pointer;font-size:15px;padding:4px;transition:color .2s}
    .eye:hover{color:#119EAE}
    .link-sm{font-size:12px;color:#119EAE;font-weight:600;cursor:pointer;text-decoration:none;text-transform:none;letter-spacing:0}
    .link-sm:hover{text-decoration:underline}

    /* check */
    .check-row{display:flex;align-items:center;gap:10px;cursor:pointer;margin-bottom:20px;font-size:13px;color:rgba(255,255,255,.6)}
    .check-row input{display:none}
    .check-box{width:18px;height:18px;border:1.5px solid rgba(255,255,255,.2);border-radius:5px;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all .3s}
    .check-row input:checked + .check-box{background:#119EAE;border-color:#119EAE}
    .check-row input:checked + .check-box::after{content:'✓';font-size:11px;color:#fff;font-weight:700}

    /* strength */
    .strength-row{display:flex;align-items:center;gap:10px;margin-top:6px}
    .strength-track{flex:1;height:4px;background:rgba(255,255,255,.1);border-radius:4px;overflow:hidden}
    .strength-bar{height:100%;border-radius:4px;transition:width .4s,background .4s}
    .strength-bar.weak{background:#e74c3c}.strength-bar.fair{background:#f39c12}.strength-bar.good{background:#3498db}.strength-bar.strong{background:#2ecc71}
    .str-label{font-size:11px;font-weight:700;width:45px}
    .str-label.weak{color:#e74c3c}.str-label.fair{color:#f39c12}.str-label.good{color:#3498db}.str-label.strong{color:#2ecc71}

    /* buttons */
    .btn-main{width:100%;background:linear-gradient(135deg,#119EAE,#0d6e7e);color:#fff;border:none;padding:14px;border-radius:12px;font-size:15px;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:10px;transition:all .3s;margin-top:4px;letter-spacing:.2px}
    .btn-main:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 10px 30px rgba(17,158,174,.5)}
    .btn-main:disabled{opacity:.5;cursor:not-allowed;transform:none}
    .btn-outline{background:transparent;border:1px solid rgba(255,255,255,.2);color:#fff;padding:11px 20px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;transition:all .3s}
    .btn-outline:hover{background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.4)}
    .spin{width:16px;height:16px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .7s linear infinite}
    @keyframes spin{to{transform:rotate(360deg)}}

    .bottom-link{text-align:center;margin-top:20px;font-size:13px;color:rgba(255,255,255,.5)}
    .bottom-link a{color:#119EAE;font-weight:600;cursor:pointer;text-decoration:none}
    .bottom-link a:hover{text-decoration:underline}

    .row2{display:grid;grid-template-columns:1fr 1fr;gap:12px}

    /* forgot */
    .forgot-hero{text-align:center;margin-bottom:28px}
    .fh-icon{font-size:52px;margin-bottom:12px;animation:wobble 3s ease-in-out infinite}
    @keyframes wobble{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
    .forgot-hero h3{font-size:20px;font-weight:700;color:#fff;margin-bottom:8px}
    .forgot-hero p{font-size:13px;color:rgba(255,255,255,.5);line-height:1.7}
    .reset-ok{text-align:center;padding:10px 0}
    .rok-icon{font-size:54px;margin-bottom:14px;animation:bounce .8s ease infinite alternate}
    @keyframes bounce{from{transform:translateY(0)}to{transform:translateY(-8px)}}
    .reset-ok h4{font-size:20px;font-weight:700;color:#fff;margin-bottom:10px}
    .reset-ok p{font-size:13px;color:rgba(255,255,255,.55);line-height:1.7;margin-bottom:16px}
    .rok-btns{display:flex;gap:10px;justify-content:center;margin-bottom:16px}

    /* security badges */
    .sec-badges{display:flex;justify-content:center;gap:16px;margin-top:24px;padding-top:18px;border-top:1px solid rgba(255,255,255,.07)}
    .sec-badges span{font-size:11px;color:rgba(255,255,255,.3);font-weight:600}

    @media(max-width:900px){
      .auth-wrap{grid-template-columns:1fr}
      .left-col{display:none}
      .auth-root{background:linear-gradient(135deg,#060c1a,#0d2137);}
      .right-col{padding:30px 16px;align-items:flex-start;padding-top:60px}
    }
  `]
})
export class AuthComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private apiService = inject(ApiService);
  private cartService = inject(CartService);
  view: AuthView = 'login';

  ld = { email: '', pass: '', rem: false };
  sd = { fn: '', ln: '', email: '', pass: '', confirm: '', terms: false };
  fe = '';
  e: any = {};
  sp1 = false; sp2 = false; sp3 = false;
  loading = false;
  resetDone = false;
  str = { pct: 0, label: '', cls: '' };
  notif = { show: false, type: 'success', msg: '' };

  trusts = [
    { icon: '🚀', title: 'Free Express Shipping', desc: 'On all orders above $99' },
    { icon: '🎁', title: 'Member-Only Deals', desc: 'Up to 70% off for members' },
    { icon: '🔄', title: '30-Day Easy Returns', desc: 'No questions asked' },
    { icon: '🛡️', title: 'Secure Payments', desc: '256-bit SSL encryption' },
  ];

  stats = [
    { val: '80K+', label: 'Happy Customers' },
    { val: '10K+', label: 'Products' },
    { val: '4.9★', label: 'Avg Rating' },
  ];

  ngOnInit() {
    const url = this.router.url;
    if (url.includes('signup')) this.view = 'signup';
    else if (url.includes('forgot')) this.view = 'forgot';
    else this.view = 'login';
  }

  switchTo(v: AuthView) {
    this.view = v; this.e = {};
    this.notif = { show: false, type: 'success', msg: '' };
    this.resetDone = false;
  }

  valEmail() {
    this.e.email = !this.ld.email ? 'Email is required.'
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.ld.email) ? 'Enter a valid email address.' : '';
  }

  valPass() {
    this.e.pass = !this.ld.pass ? 'Password is required.'
      : this.ld.pass.length < 6 ? 'Password must be at least 6 characters.' : '';
  }

  calcStrength() {
    const p = this.sd.pass; let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    this.str = [
      { pct: 0, label: '', cls: '' },
      { pct: 25, label: 'Weak', cls: 'weak' },
      { pct: 50, label: 'Fair', cls: 'fair' },
      { pct: 75, label: 'Good', cls: 'good' },
      { pct: 100, label: 'Strong', cls: 'strong' },
    ][s];
  }

  onLogin() {
    this.valEmail(); this.valPass();
    if (this.e.email || this.e.pass) return;
    this.loading = true;
    this.apiService.login({ email: this.ld.email, password: this.ld.pass }).subscribe({
      next: (res) => {
        this.loading = false;
        this.authService.login(res.user, res.token);
        this.cartService.loadFromAtlas();   // ← load saved cart from MongoDB
        this.showNotif('success', `✓ Welcome back, ${res.user.firstName}! Redirecting...`);
        setTimeout(() => this.router.navigate(['/']), 1200);
      },
      error: (err) => {
        this.loading = false;
        this.showNotif('error', err.error?.message || 'Login failed. Please try again.');
      }
    });
  }

  onSignup() {
    if (!this.sd.fn || !this.sd.ln || !this.sd.email || !this.sd.pass) {
      this.showNotif('error', 'Please fill in all required fields.'); return;
    }
    if (this.sd.pass !== this.sd.confirm) {
      this.showNotif('error', 'Passwords do not match.'); return;
    }
    if (this.sd.pass.length < 6) {
      this.showNotif('error', 'Password must be at least 6 characters.'); return;
    }
    if (!this.sd.terms) {
      this.showNotif('error', 'Please accept the Terms & Privacy Policy to continue.'); return;
    }
    this.loading = true;
    this.apiService.register({ firstName: this.sd.fn, lastName: this.sd.ln, email: this.sd.email, password: this.sd.pass }).subscribe({
      next: (res) => {
        this.loading = false;
        this.authService.login(res.user, res.token);
        this.showNotif('success', `🎉 Account created! Welcome, ${res.user.firstName}!`);
        setTimeout(() => this.router.navigate(['/']), 1400);
      },
      error: (err) => {
        this.loading = false;
        this.showNotif('error', err.error?.message || 'Registration failed. Please try again.');
      }
    });
  }

  onForgot() {
    if (!this.fe || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.fe)) {
      this.showNotif('error', 'Please enter a valid email address.'); return;
    }
    this.loading = true;
    setTimeout(() => { this.loading = false; this.resetDone = true; }, 1600);
  }

  socialLogin(p: string) {
    this.authService.login({ firstName: 'Demo', lastName: 'User', email: 'demo@electshop.com' });
    this.showNotif('success', `Connecting to ${p}... (Demo mode)`);
    setTimeout(() => this.router.navigate(['/']), 1400);
  }

  private showNotif(type: 'success' | 'error', msg: string) {
    this.notif = { show: true, type, msg };
    if (type === 'success') setTimeout(() => this.notif.show = false, 4000);
  }
}
