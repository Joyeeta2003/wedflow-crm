import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterLink } from '@angular/router';

type ProfileType = 'individual' | 'team';

@Component({
  selector: 'app-freelancer-register',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterLink],
  templateUrl: './freelancer-register.html',
  styleUrl: './freelancer-register.scss'
})
export class FreelancerRegister {
  profileType = signal<ProfileType>('individual');

  displayName = signal('');
  contactName = signal('');
  email = signal('');
  phone = signal('');
  city = signal('');
  state = signal('');
  experience = signal(0);
  teamSize = signal(2);
  rate = signal('');
  availability = signal('Available for projects');
  portfolio = signal('');
  about = signal('');

  services = [
    'Wedding Photographer',
    'Cinematographer',
    'Traditional Videographer',
    'Drone Operator',
    'Photo Editor',
    'Video Editor',
    'Album Designer',
    'Live Streaming Team',
    'Lighting Team',
    'Other'
  ];
  selectedServices = signal<string[]>([]);

  isSubmitting = signal(false);

  setProfileType(type: ProfileType): void {
    this.profileType.set(type);
  }

  toggleService(service: string): void {
    const current = this.selectedServices();
    this.selectedServices.set(
      current.includes(service)
        ? current.filter(s => s !== service)
        : [...current, service]
    );
  }

  isServiceSelected(service: string): boolean {
    return this.selectedServices().includes(service);
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      return;
    }

    this.isSubmitting.set(true);

    console.log('Freelancer registration submitted:', {
      profileType: this.profileType(),
      displayName: this.displayName(),
      contactName: this.contactName(),
      email: this.email(),
      phone: this.phone(),
      city: this.city(),
      state: this.state(),
      experience: this.experience(),
      teamSize: this.profileType() === 'team' ? this.teamSize() : null,
      rate: this.rate(),
      availability: this.availability(),
      portfolio: this.portfolio(),
      about: this.about(),
      services: this.selectedServices()
    });

    // TODO: এখানে আসল API কল বসাও
    setTimeout(() => {
      this.isSubmitting.set(false);
    }, 800);
  }
}