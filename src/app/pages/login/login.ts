import { Component, signal, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

declare global {
  interface Window {
    turnstile: {
      render: (container: string | Element, options: any) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
      execute: (widgetId?: string) => void;
    };
  }
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login implements AfterViewInit, OnDestroy {
  email = signal('');
  isSubmitting = signal(false);
  turnstileWidgetId: string | null = null;
  turnstileToken = signal('');

  private readonly siteKey = '0x4AAAAAAEcn1Jmd8qWFCt59';

  constructor(private router: Router, private location: Location) {}

  ngAfterViewInit(): void {
    this.loadTurnstile();
  }

  ngOnDestroy(): void {
    if (this.turnstileWidgetId && window.turnstile) {
      window.turnstile.remove(this.turnstileWidgetId);
    }
  }

  private loadTurnstile(): void {
    const existingScript = document.querySelector('script[data-turnstile]');

    if (window.turnstile) {
      this.renderTurnstile();
      return;
    }

    if (existingScript) {
      existingScript.addEventListener('load', () => this.renderTurnstile(), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    (script as any).dataset.turnstile = 'true';
    script.onload = () => this.renderTurnstile();
    script.onerror = () => { console.error('Cloudflare Turnstile script failed to load'); };
    document.head.appendChild(script);
  }

  private renderTurnstile(): void {
    const container = document.querySelector<HTMLElement>('.turnstile-box');
    if (!container || !window.turnstile) {
      return;
    }

    if (this.turnstileWidgetId && window.turnstile) {
      try {
        window.turnstile.remove(this.turnstileWidgetId);
      } catch {
        // no-op: widget may already be removed
      }
    }

    this.turnstileWidgetId = window.turnstile.render(container, {
      sitekey: this.siteKey,
      callback: (token: string) => {
        this.turnstileToken.set(token);
      },
      'expired-callback': () => {
        this.turnstileToken.set('');
      },
      'error-callback': () => {
        this.turnstileToken.set('');
        console.error('Turnstile verification failed');
      },
    });
  }

  goBack(): void {
    this.location.back();
  }

  closeLogin(): void {
    this.router.navigate(['/']);
  }

  async onSendOtp(): Promise<void> {
    if (!this.email()) {
      return;
    }

    if (!this.turnstileToken()) {
      alert('Please complete the verification');
      return;
    }

    this.isSubmitting.set(true);

    try {
      const response = await fetch('http://localhost:5001/api/auth/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: this.email(),
          turnstileToken: this.turnstileToken(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      localStorage.setItem('otp_email', this.email());
      this.router.navigate(['/verify-otp']);
    } catch (error) {
      console.error('Error sending OTP:', error);
      alert(error instanceof Error ? error.message : 'Failed to send OTP');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}