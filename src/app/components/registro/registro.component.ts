import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { addDoc, collection, getFirestore } from 'firebase/firestore';
import { dniExisteAsyncValidator } from '../../validators/dni.validator';
import { DniService } from '../../services/dni.service';
import { NgIf } from '@angular/common';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { Firestore, collectionData } from '@angular/fire/firestore';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {
  imagenUno: any;
  imagenDos: any;
  errorMsg: string = '';
  regPaciente: boolean | null = null;
  user: any;
  form: any;
  especialidades: any;

  constructor(private firestore: Firestore, private authService: AuthService, private router: Router, private dniService: DniService) {}

  ngOnInit() {
    this.traerEspecialidades();
  }

  configReg(rol: string) {
    if(rol == 'paciente') {
      this.regPaciente = true;

      this.form = new FormGroup ({
        nombre: new FormControl('', [Validators.pattern('^[a-zA-Z]+$'), Validators.required]),
        apellido: new FormControl('', [Validators.pattern('^[a-zA-Z]+$'), Validators.required]),
        edad: new FormControl('', [Validators.required, Validators.min(0), Validators.max(120)]),
        dni: new FormControl('', {
          validators: [Validators.required, Validators.pattern('^[0-9]+$')],
          asyncValidators: dniExisteAsyncValidator(this.dniService, 'pacientes'),
          updateOn: 'blur'
        }),
        obraSocial: new FormControl('', [Validators.required]),
        mail: new FormControl('', [Validators.required]),
        pass: new FormControl('', [Validators.required]),
        passRep: new FormControl('', [Validators.required]),
        imagenUno: new FormControl('', [Validators.required]),
        imagenDos: new FormControl('', [Validators.required]),
      });
    }
    else {
      this.regPaciente = false;

      this.form = new FormGroup ({
        nombre: new FormControl('', [Validators.pattern('^[a-zA-Z]+$'), Validators.required]),
        apellido: new FormControl('', [Validators.pattern('^[a-zA-Z]+$'), Validators.required]),
        edad: new FormControl('', [Validators.required, Validators.min(0), Validators.max(120)]),
        dni: new FormControl('', {
          validators: [Validators.required, Validators.pattern('^[0-9]+$')],
          asyncValidators: dniExisteAsyncValidator(this.dniService, 'especialistas'),
          updateOn: 'blur'
        }),
        especialidad: new FormControl('', [Validators.required]),
        mail: new FormControl('', [Validators.required]),
        pass: new FormControl('', [Validators.required]),
        passRep: new FormControl('', [Validators.required]),
        imagenUno: new FormControl('', [Validators.required]),
      });
    }
  }

  onFileSelected(event: any, imageType: string) {
    if (event.target.files.length > 0) {
      if (imageType === 'imagenUno') {
        this.imagenUno = event.target.files[0];
      } else {
        this.imagenDos = event.target.files[0];
      }
    }
  }

  register() {
    if(this.form.get('pass')!.value == this.form.get('passRep')!.value) {
      this.authService.register(this.form.get('mail')!.value, this.form.get('pass')!.value)
        .then(res => {
          if(this.regPaciente) {
            this.user = {
              uid: res.user.uid,
              nombre: this.form.get('nombre')!.value,
              apellido: this.form.get('apellido')!.value,
              edad: this.form.get('edad')!.value,
              dni: this.form.get('dni')!.value,
              rol: 'Paciente',
              obraSocial: this.form.get('obraSocial')!.value,
              mail: this.form.get('mail')!.value,
              pass: this.form.get('pass')!.value,
              imagenUno: 'this.imagenUno',
              imagenDos: 'this.imagenDos'
            }
          }
          else {
            this.user = {
              uid: res.user.uid,
              nombre: this.form.get('nombre')!.value,
              apellido: this.form.get('apellido')!.value,
              edad: this.form.get('edad')!.value,
              dni: this.form.get('dni')!.value,
              rol: 'Especialista',
              especialidad: this.form.get('especialidad')!.value,
              mail: this.form.get('mail')!.value,
              pass: this.form.get('pass')!.value,
              imagenUno: 'this.imagenUno',
              habilitado: false
            }
          }

          this.addNewUser(this.user);
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
              
            case 'auth/email-already-in-use': 
              this.errorMsg = 'El correo electronico ya esta en uso.';
              break;

            case 'auth/weak-password': 
              this.errorMsg = 'La contraseña debe tener al menos 6 caracteres.';
              break;
          }
        });
    }
    else {
      console.log('Las contraseñas no coinciden.');
    }
  }

  
  async addNewUser(user: any) {
    if(user.rol == 'Paciente') {  
      user.imagenUno = await this.saveImage(this.imagenUno, user.uid + '/imagenUno');
      user.imagenDos = await this.saveImage(this.imagenDos, user.uid + '/imagenDos');

      let col = collection(getFirestore(), 'pacientes');
      addDoc(col, user)
        .then((res) => {
          console.log(res.id);
        });
    }
    else if (user.rol == 'Especialista') {
      user.imagenUno = await this.saveImage(this.imagenUno, user.uid + '/imagenUno');

      let col = collection(getFirestore(), 'especialistas');
      addDoc(col, user);
    }
  }

  async saveImage(foto: any, path: string) {
    let storageRef = ref(getStorage(), path);
    await uploadBytes(storageRef, foto)
    return await getDownloadURL(storageRef)
  }

  async traerEspecialidades() {
    let col = collection(this.firestore, 'especialidades');
    const observable = collectionData(col);

    observable.subscribe((res) => {
      this.especialidades = res;
    })
  }

  agregarEspecialidad() {
    const inputEl = document.getElementById('nuevaEspecialidad') as HTMLInputElement;
    
    if(inputEl.value != '' && this.verificarEspecialidad(inputEl.value)) {
      let col = collection(this.firestore, 'especialidades');
      addDoc(col, {nombre: inputEl.value});
  
      this.form.patchValue({
        especialidad: inputEl.value
      });
    }
  }


  verificarEspecialidad(especialidadIngresada: string) {
    const especialidad = this.especialidades.find((e: any) => e.nombre === especialidadIngresada);

    if(especialidad) {
      this.form.patchValue({
        especialidad: especialidadIngresada
      });
      return false;
    }
    else {
      return true;
    }
  }

}
