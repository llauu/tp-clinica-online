import { Component } from '@angular/core';
import { Firestore, collectionData } from '@angular/fire/firestore';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { collection, query, where } from 'firebase/firestore';
import { NgxSpinnerService, NgxSpinnerModule } from 'ngx-spinner';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, NgxSpinnerModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  pass: string = '';
  errorMsg: string = '';

  constructor(private firestore: Firestore, private router: Router, private authService: AuthService, private spinner: NgxSpinnerService) { }

  // async getRol(coleccion: string, mail: string) {
  //   console.log(mail);
  //   let col = collection(this.firestore, coleccion);
  //   let q = query(col, where('mail', '==', mail));
  //   let observable = collectionData(q);

  //   observable.subscribe((res) => {
  //     // console.log(res[0]);
  //     if(res[0]) {
  //       // console.log(coleccion);
  //       // console.log(res[0])
  //       this.authService.setUserInfo(res[0]);
  //       return true;
  //     }
  //     return false;
  //   })
  //   return false;
  // }

  async login() {
    this.spinner.show();

    this.authService.validateEspecialista(this.email)
      .then(() => {
        this.authService.login(this.email, this.pass)
          .then((res: any) => {
            let col = collection(this.firestore, 'usuarios');
            let q = query(col, where('uid', '==', res.user.uid));
            let observable = collectionData(q);

            observable.subscribe((res) => {
              if(res[0]) {
                this.authService.setUserInfo(res[0]);
              }
            })
            
            this.spinner.hide();
            this.router.navigate(['/bienvenida']);
          })
          .catch(err => {
            switch(err.code) {
              case 'auth/invalid-email': 
                this.errorMsg = 'El correo electronico no es valido.';
                break;

              case 'auth/missing-password': 
                this.errorMsg = 'La contraseña no es valida.';
                break;
                
              case 'auth/invalid-credential': 
                this.errorMsg = 'El correo electronico o contraseña son incorrectos.';
                break;

              default:
                this.errorMsg = err;
                break;
            }
            this.spinner.hide();
          });
      })
      .catch(err => {
        this.errorMsg = err;
        this.spinner.hide();
      })
  }
  
  
  fillInputs(mail: string, pass: string) {
    const emailInput = document.getElementById('email') as HTMLInputElement;
    if (emailInput) {
      emailInput.value = mail;
      this.email = mail;
    }
    
    const passInput = document.getElementById('pass') as HTMLInputElement;
    if (passInput) {
      passInput.value = pass;
      this.pass = pass;
    }
  }
}
