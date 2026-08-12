import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  email = signal('');
  isSubmitting = signal(false);

  constructor(private router: Router, private location: Location) {}

  goBack():void{
    this.location.back();
  }
  
  closeLogin(): void {
    this.router.navigate(['/']);
  }

  onSendOtp(): void {
    if (!this.email()) {
      return;
    }
    this.isSubmitting.set(true);

    // TODO: call your OTP API here, then navigate to OTP-verify page
    // e.g. this.router.navigate(['/verify-otp'], { queryParams: { email: this.email() } });

    console.log('Sending OTP to:', this.email());

    this.router.navigate(['/dashboard']);
  }
}