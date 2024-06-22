import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { Firestore, collectionData } from '@angular/fire/firestore';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';
import { NgxSpinnerService, NgxSpinnerModule } from 'ngx-spinner';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [NgFor, RouterLink, NgxSpinnerModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent {
  pacientes: any[] = [];
  especialistas: any[] = [];
  admins: any[] = [];

  constructor(private firestore: Firestore, private authService: AuthService, private spinner: NgxSpinnerService) {}

  ngOnInit() {
    this.spinner.show();
    this.getUsers();
  }

  getUsers() {
    this.pacientes = [];
    this.especialistas = [];
    this.admins = [];

    let col = collection(this.firestore, 'usuarios');

    const observable = collectionData(col);

    observable.subscribe((data) => {
      this.pacientes = data.filter(user => user['rol'] === 'paciente');
      this.especialistas = data.filter(user => user['rol'] === 'especialista');
      this.admins = data.filter(user => user['rol'] === 'admin');

      this.spinner.hide();
    });
  }
  
  async cambiarHabilitacion(especialista: any) {
    const especialistasRef = collection(this.firestore, 'usuarios');

    // const q = query(especialistasRef, where('uid', '==', especialista.uid));
    const q = query(especialistasRef, where('mail', '==', especialista.mail));

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      this.authService.register(especialista.mail, especialista.pass)
        .then((res: any) => {
          const docRef = querySnapshot.docs[0].ref;

          // await updateDoc(docRef, {
          updateDoc(docRef, {
            uid: res,
            habilitado: true,
          });
        });
    }
  }

}
