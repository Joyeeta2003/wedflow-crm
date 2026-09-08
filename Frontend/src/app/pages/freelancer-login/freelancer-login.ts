import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-freelancer-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './freelancer-login.html',
  styleUrl: './freelancer-login.scss'

})
export class FreelancerLogin {
  email = signal('');
  isSubmitting = signal(false);

  constructor(private router: Router, private location:Location) {}

  goBack(): void {
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

    // TODO: call your freelancer OTP API here, then navigate to OTP-verify page
    console.log('Sending OTP to freelancer:', this.email());
  }
}