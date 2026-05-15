import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
  selector: 'app-guide',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './guide.component.html',
  styleUrls: ['./guide.component.scss'],
})
export class GuideComponent {
  private router = inject(Router);
  back(): void { this.router.navigate(['/menu']); }
}
