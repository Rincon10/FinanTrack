import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    TranslateModule
  ],
  template: `
    <div class="app-container" *ngIf="authService.isAuthenticated(); else loginTemplate">
      <mat-toolbar color="primary" class="app-toolbar">
        <button mat-icon-button (click)="sidenav.toggle()">
          <mat-icon>menu</mat-icon>
        </button>
        <span>{{ 'APP.TITLE' | translate }}</span>
        <span class="toolbar-spacer"></span>
        <button mat-icon-button [matMenuTriggerFor]="userMenu">
          <mat-icon>account_circle</mat-icon>
        </button>
        <mat-menu #userMenu="matMenu">
          <button mat-menu-item routerLink="/settings">
            <mat-icon>settings</mat-icon>
            <span>{{ 'NAV.SETTINGS' | translate }}</span>
          </button>
          <button mat-menu-item (click)="logout()">
            <mat-icon>exit_to_app</mat-icon>
            <span>{{ 'NAV.LOGOUT' | translate }}</span>
          </button>
        </mat-menu>
      </mat-toolbar>

      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav #sidenav mode="side" opened class="sidenav">
          <mat-nav-list>
            <a mat-list-item routerLink="/dashboard" routerLinkActive="active">
              <mat-icon matListItemIcon>dashboard</mat-icon>
              <span matListItemTitle>{{ 'NAV.DASHBOARD' | translate }}</span>
            </a>
            <a mat-list-item routerLink="/budgets" routerLinkActive="active">
              <mat-icon matListItemIcon>account_balance_wallet</mat-icon>
              <span matListItemTitle>{{ 'NAV.BUDGETS' | translate }}</span>
            </a>
            <a mat-list-item routerLink="/transactions" routerLinkActive="active">
              <mat-icon matListItemIcon>receipt_long</mat-icon>
              <span matListItemTitle>{{ 'NAV.TRANSACTIONS' | translate }}</span>
            </a>
            <a mat-list-item routerLink="/categories" routerLinkActive="active">
              <mat-icon matListItemIcon>category</mat-icon>
              <span matListItemTitle>{{ 'NAV.CATEGORIES' | translate }}</span>
            </a>
          </mat-nav-list>
        </mat-sidenav>

        <mat-sidenav-content class="main-content">
          <div class="container">
            <router-outlet></router-outlet>
          </div>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>

    <ng-template #loginTemplate>
      <router-outlet></router-outlet>
    </ng-template>
  `,
  styles: [`
    .app-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
    }
    .toolbar-spacer { flex: 1 1 auto; }
    .sidenav-container {
      flex: 1;
    }
    .sidenav {
      width: 240px;
    }
    .main-content {
      padding: 0;
    }
    .active {
      background-color: rgba(0, 0, 0, 0.05);
    }
    @media (max-width: 768px) {
      .sidenav { width: 200px; }
    }
  `]
})
export class AppComponent implements OnInit {
  constructor(
    public authService: AuthService,
    private translate: TranslateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const locale = localStorage.getItem('locale') || 'es';
    this.translate.use(locale);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth']);
  }
}
