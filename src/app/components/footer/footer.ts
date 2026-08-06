import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer {
  readonly currentYear = new Date().getFullYear();

  readonly contactLinks = [
    { label: 'Terms & Conditions', href: '/terms-and-conditions', type: 'primary' },
    { label: 'hello@wedflowcrm.com', href: 'mailto:hello@wedflowcrm.com', type: 'secondary' },
    { label: '7980510164', href: 'tel:7980510164', type: 'secondary' },
  ];
}