import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { NgIf } from '@angular/common';
import { NgxSpinnerService, NgxSpinnerModule } from 'ngx-spinner';

@Component({
  selector: 'app-bienvenida',
  standalone: true,
  imports: [RouterLink, NgIf, NgxSpinnerModule],
  templateUrl: './bienvenida.component.html',
  styleUrl: './bienvenida.component.css',
})
export class BienvenidaComponent {
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
    this.authService.isAuthenticated()
      .then(res => {
        if(res !== null) {
          this.isLoggedIn = true;
          // this.user = res;

          this.authService.getUserInfo()
            .then((userInfo: any) => { 
              // console.log(userInfo);
              // this.userInfo = userInfo;
              this.spinner.hide();
            })
        }
        
        this.spinner.hide();
      })
      .catch(err => {
        console.log(err)
        this.spinner.hide(); 
      });
  }
}
