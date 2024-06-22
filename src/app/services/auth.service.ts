import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { Firestore, collectionData } from '@angular/fire/firestore';
import { collection, query, where } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  user: any;
  userInfo: any;
  rol!: 'paciente' | 'especialista' | 'admin';

  constructor(private auth : Auth, private firestore: Firestore) { }

  async register(mail: string, pass: string) {
    return new Promise((resolve, reject) => {
      createUserWithEmailAndPassword(this.auth, mail, pass)
        .then((userCredential: any) => {
          sendEmailVerification(userCredential.user);
          let uid = userCredential.user.uid;

          this.logout()
            .then(() => {
              resolve(uid);
            });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  login(mail: string, pass: string) {
    return new Promise((resolve, reject) => {
      signInWithEmailAndPassword(this.auth, mail, pass)
        .then((userCredential: any) => {
          if(userCredential.user.emailVerified) {
            resolve(userCredential);
          }
          else {
            this.logout() 
              .then(() => {
                reject('Debes verificar tu correo electronico.');
              });
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  logout() {
    return signOut(this.auth);
  }

  setUserInfo(user: any) {
    this.userInfo = user;
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

  
  getUserInfo() {
    return new Promise((resolve) => {
      let col = collection(this.firestore, 'usuarios');
      let q = query(col, where('uid', '==', this.auth.currentUser?.uid));
      let observable = collectionData(q);
  
      observable.subscribe((res) => {
        if(res[0]) {
          this.userInfo = res[0];
          this.rol = res[0]['rol'];
          resolve(res[0]);
        }
      })
    });
  }

  getUserRol(mail: string) {
    return new Promise((resolve) => {
      let col = collection(this.firestore, 'usuarios');
      let q = query(col, where('mail', '==', mail));
      let observable = collectionData(q);
  
      observable.subscribe((res) => {
        if(res[0]) {
          resolve(res[0]['rol']);
        }
      })
    });
  }

  validateEspecialista(mail: string) {
    return new Promise((resolve, reject) => {
      let col = collection(this.firestore, 'usuarios');
      let q = query(col, where('mail', '==', mail));
      let observable = collectionData(q);
  
      observable.subscribe((res) => {
        if(res[0]) {
          if(res[0]['rol'] == 'especialista' && res[0]['habilitado'] == false) {
            reject('Tu cuenta aun no fue habilitada.');
          }
          else {
            resolve(true);
          }
        }
        else {
          reject('El correo electronico no se encuentra registrado.');
        }
      })
    });
  }
}
