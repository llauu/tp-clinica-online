import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { Firestore, collectionData } from '@angular/fire/firestore';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [NgFor],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent {
  pacientes: any;
  especialistas: any;
  admins: any;

  constructor(private firestore: Firestore) {}

  ngOnInit() {
    this.getPacientes();
    this.getEspecialistas();
    this.getAdmins();
  }
  
  getPacientes() {
    let col = collection(this.firestore, 'pacientes');

    const observable = collectionData(col);

    observable.subscribe((data) => {
      this.pacientes = data;
      console.log(data)
    });
  }

  getEspecialistas() {
    let col = collection(this.firestore, 'especialistas');

    const observable = collectionData(col);

    observable.subscribe((data) => {
      this.especialistas = data;
    });
  }

  getAdmins() {
    let col = collection(this.firestore, 'admins');

    const observable = collectionData(col);

    observable.subscribe((data) => {
      this.admins = data;
    });
  }
  
  async cambiarHabilitacion(especialista: any) {
    const especialistasRef = collection(this.firestore, 'especialistas');

    const q = query(especialistasRef, where('uid', '==', especialista.uid));

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;

      await updateDoc(docRef, {
        habilitado: !especialista.habilitado
      });
    }
  }



}
