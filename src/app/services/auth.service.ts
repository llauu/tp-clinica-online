import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user: any;
  rol!: 'Paciente' | 'Especialista' | 'Admin';

  constructor(private auth : Auth) { }

  async register(mail: string, pass: string) {
    return createUserWithEmailAndPassword(this.auth, mail, pass);
  }

  async login(mail: string, pass: string) {
    return signInWithEmailAndPassword(this.auth, mail, pass);
  }

  logout() {
    return signOut(this.auth);
  }

  isAuthenticated() {
    return new Promise<any>((res, rej) => {
      this.auth.onAuthStateChanged(user => {
        // return user ? res(true) : res(false);
        res(user);
      });
    });
  }

  getUser() {
    return this.auth.currentUser;
  }
}
