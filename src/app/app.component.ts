import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { NgxSpinnerService, NgxSpinnerModule } from 'ngx-spinner';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgxSpinnerModule, NgIf],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'tp-clinica-online';
  user: any;
  userInfo: any;
  rol: string = '';
  isLoggedIn: boolean = false;

  constructor(public authService: AuthService, private router: Router, private spinner: NgxSpinnerService) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.checkAuthState();
      }
    });
  }

  ngOnInit() {
    this.spinner.show();
    this.checkAuthState();
  }
  
  checkAuthState() {
    this.spinner.show();
    this.authService.isAuthenticated()
      .then(res => {
        if(res !== null) {
          this.isLoggedIn = true;
          this.user = res;

          this.authService.getUserInfo()
            .then((userInfo: any) => { 
              this.userInfo = userInfo;
              this.rol = userInfo.rol;

              this.spinner.hide();
            })
        }
      })
      .catch(err => {
        console.log(err)

        this.spinner.hide();
      });
      
      this.spinner.hide();
  }

  logout() {
    this.authService.logout()
      .then(() => {
        this.isLoggedIn = false;
        this.user = null;
        this.userInfo = null;
        this.rol = '';
        this.router.navigate(['/login'])
      })
      .catch(err => console.log(err));
  }
}
