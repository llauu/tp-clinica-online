import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NgxSpinnerService, NgxSpinnerModule } from 'ngx-spinner';
import { NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Firestore, addDoc, collectionData } from '@angular/fire/firestore';
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [NgxSpinnerModule, NgIf, ReactiveFormsModule],
  templateUrl: './mi-perfil.component.html',
  styleUrl: './mi-perfil.component.css'
})
export class MiPerfilComponent {
  user: any;
  horariosForm!: FormGroup;

  constructor(private auth: AuthService, private spinner: NgxSpinnerService, private fb: FormBuilder, private firestore: Firestore) { } 

  ngOnInit() {
    this.spinner.show();

    this.horariosForm = this.fb.group({
      entrada: [''],
      salida: ['']
    });

    this.auth.getUserInfo()
      .then((res) => {
        this.user = res;

        const col = collection(this.firestore, 'horarios');
        const q = query(col, where('uid', '==', this.user.uid));
        let observable = collectionData(q);

        observable.subscribe((res) => {
          if(res[0]) {
            this.horariosForm = this.fb.group({
              entrada: [res[0]['entrada']],
              salida: [res[0]['salida']]
            });
          }
        })
        
        this.spinner.hide();
      })
      .catch((err) => {
        console.log(err);
        this.spinner.hide();
      });   
  }

  
  async guardarHorariosEspecialista() {
    this.spinner.show();

    const horarios = {
      uid: this.user.uid,
      especialidad: this.user.especialidad,
      entrada: this.horariosForm.value.entrada,
      salida: this.horariosForm.value.salida
    }

    const horariosRef = collection(this.firestore, 'horarios');

    const q = query(horariosRef, where('uid', '==', this.user.uid));

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref;

      updateDoc(docRef, horarios);
      this.spinner.hide();
    }
    else {
      addDoc(horariosRef, horarios);
      this.spinner.hide();
    }
  }
}
