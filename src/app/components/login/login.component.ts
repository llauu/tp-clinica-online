import { Component } from '@angular/core';
import { Firestore, collectionData } from '@angular/fire/firestore';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { collection, query, where } from 'firebase/firestore';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  pass: string = '';
  errorMsg: string = '';

  constructor(private firestore: Firestore, private router: Router, private authService: AuthService) { }

  login() {
    this.authService.login(this.email, this.pass)
      .then(res => {
        let col = collection(this.firestore, 'users');
        const q = query(col, where('mail', '==', res['user'].email));

        const observable = collectionData(q);

        observable.subscribe((res) => {
          console.log(res[0]);
        })
        
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
        }
      });
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
