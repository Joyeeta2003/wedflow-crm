import { Component, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { Feature } from '../features';

@Component({
  selector: 'app-feature-card',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './feature-card.html',
  styleUrl: './feature-card.scss'
})
export class FeatureCard {
  feature = input.required<Feature>();
}