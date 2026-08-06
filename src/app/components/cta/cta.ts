import { Component } from '@angular/core';

@Component({
  selector: 'app-cta',
  standalone: true,
  imports: [],
  templateUrl: './cta.html',
  styleUrl: './cta.scss'
})
export class Cta {
  readonly stars = Array(5).fill(0);

  readonly heading = 'Ready to transform your studio?';
  readonly subtitle = 'Join hundreds of wedding studios already using WedFlow CRM to streamline their operations.';
  readonly buttonText = 'Get Started Now';
}
