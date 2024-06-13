import { Component } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Firestore, addDoc, collection, collectionData, getDocs, orderBy, query } from '@angular/fire/firestore';
import { where } from 'firebase/firestore';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'tp-clinica-online';
  user: any;
  userInfo: any;
  isLoggedIn: boolean = false;

  constructor(public authService: AuthService, private router: Router, private firestore: Firestore) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.checkAuthState();
      }
    });
  }
  
  checkAuthState() {
    this.authService.isAuthenticated()
      .then(res => {
        if(res !== null) {
          this.isLoggedIn = true;
          // this.user = this.authService.getUser();
          this.user = res;
          this.getUserInfo('Paciente', res.uid);
        }
      })
      .catch(err => console.log(err));
  }

  logout() {
    this.authService.logout()
      .then(() => {
        this.isLoggedIn = false;
        this.router.navigate(['/login'])
      })
      .catch(err => console.log(err));
  }

  async getUserInfo(rol: string, uid: string) {
    let coleccion;
    console.log('inicio')
    console.log(rol)
    switch(rol) {
      case 'Paciente':
        coleccion = 'pacientes';
        break;
      case 'Especialista':
        coleccion = 'especialistas';
        break;
      case 'Admin':
        coleccion = 'admins';
        break;
      default:
        coleccion = ''; 
    }

    const docRef = collection(this.firestore, coleccion);

    const q = query(docRef, where('uid', '==', uid));

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      this.userInfo = querySnapshot.docs[0].data();
    }
  }
}
