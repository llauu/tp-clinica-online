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
import { NgxSpinnerService, NgxSpinnerModule } from 'ngx-spinner';

@Component({
  selector: 'app-registro-admin',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgxSpinnerModule],
  templateUrl: './registro-admin.component.html',
  styleUrl: './registro-admin.component.css'
})
export class RegistroAdminComponent {
  rol: string = '';
  imagenUno: any;
  imagenDos: any;
  errorMsg: string = '';
  regPaciente: boolean | null = null;
  user: any;
  form: any;
  especialidades: any;

  constructor(private firestore: Firestore, private authService: AuthService, private router: Router, private dniService: DniService, private spinner: NgxSpinnerService) { }

  ngOnInit() {
    this.traerEspecialidades();
  }

  configReg(rol: string) {
    switch(rol) {
      case 'paciente': 
        this.rol = 'paciente';
        this.regPaciente = true;

        this.form = new FormGroup ({
          nombre: new FormControl('', [Validators.pattern('^[a-zA-Z]+$'), Validators.required]),
          apellido: new FormControl('', [Validators.pattern('^[a-zA-Z]+$'), Validators.required]),
          edad: new FormControl('', [Validators.required, Validators.min(0), Validators.max(120)]),
          dni: new FormControl('', {
            validators: [Validators.required, Validators.pattern('^[0-9]+$')],
            asyncValidators: dniExisteAsyncValidator(this.dniService, 'usuarios'),
            updateOn: 'blur'
          }),
          obraSocial: new FormControl('', [Validators.required]),
          mail: new FormControl('', [Validators.required]),
          pass: new FormControl('', [Validators.required]),
          passRep: new FormControl('', [Validators.required]),
          imagenUno: new FormControl('', [Validators.required]),
          imagenDos: new FormControl('', [Validators.required]),
        });
        break;

      case 'especialista': 
        this.rol = 'especialista';
        this.regPaciente = false;

        this.form = new FormGroup ({
          nombre: new FormControl('', [Validators.pattern('^[a-zA-Z]+$'), Validators.required]),
          apellido: new FormControl('', [Validators.pattern('^[a-zA-Z]+$'), Validators.required]),
          edad: new FormControl('', [Validators.required, Validators.min(0), Validators.max(120)]),
          dni: new FormControl('', {
            validators: [Validators.required, Validators.pattern('^[0-9]+$')],
            asyncValidators: dniExisteAsyncValidator(this.dniService, 'usuarios'),
            updateOn: 'blur'
          }),
          especialidad: new FormControl('', [Validators.required]),
          mail: new FormControl('', [Validators.required]),
          pass: new FormControl('', [Validators.required]),
          passRep: new FormControl('', [Validators.required]),
          imagenUno: new FormControl('', [Validators.required]),
        });
        break;

      case 'admin':
        this.rol = 'admin';
        this.regPaciente = false;
        
        this.form = new FormGroup ({
          nombre: new FormControl('', [Validators.pattern('^[a-zA-Z]+$'), Validators.required]),
          apellido: new FormControl('', [Validators.pattern('^[a-zA-Z]+$'), Validators.required]),
          edad: new FormControl('', [Validators.required, Validators.min(0), Validators.max(120)]),
          dni: new FormControl('', {
            validators: [Validators.required, Validators.pattern('^[0-9]+$')],
            asyncValidators: dniExisteAsyncValidator(this.dniService, 'usuarios'),
            updateOn: 'blur'
          }),
          mail: new FormControl('', [Validators.required]),
          pass: new FormControl('', [Validators.required]),
          passRep: new FormControl('', [Validators.required]),
          imagenUno: new FormControl('', [Validators.required]),
        });
        break;
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
      this.spinner.show();

      let nombre = this.form.get('nombre')!.value;
      let apellido = this.form.get('apellido')!.value;
      let edad = this.form.get('edad')!.value;
      let dni = this.form.get('dni')!.value;
      let mail = this.form.get('mail')!.value;
      let pass = this.form.get('pass')!.value;
      let tmp = '';

      if(this.rol != 'admin') {
        tmp = this.regPaciente ? this.form.get('obraSocial')!.value : this.form.get('especialidad')!.value;
      }

      this.authService.register(mail, pass)
      .then((res: any) => {
        switch(this.rol) {
          case 'paciente': 
            this.user = {uid: res, nombre, apellido, edad, dni, rol: 'paciente', obraSocial: tmp, mail, pass, imagenUno: '', imagenDos: ''};
            break;

          case 'especialista': 
            this.user = {uid: res, nombre, apellido, edad, dni, rol: 'especialista', especialidad: tmp, mail, pass, imagenUno: '', habilitado: true};
            break;
          
          case 'admin':
            this.user = {uid: res, nombre, apellido, edad, dni, rol: 'admin', mail, pass, imagenUno: ''};
            break;
        }

        this.addNewUser(this.user);
        this.spinner.hide();
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
        
        this.spinner.hide();
      });
    }
    else {
      this.errorMsg = 'Las contraseñas no coinciden.';
    }
  }

  
  async addNewUser(user: any) {
    if(user.rol == 'paciente') {  
      user.imagenUno = await this.saveImage(this.imagenUno, user.uid + '/imagenUno');
      user.imagenDos = await this.saveImage(this.imagenDos, user.uid + '/imagenDos');
    }
    else { // especialistas o admins
      user.imagenUno = await this.saveImage(this.imagenUno, user.uid + '/imagenUno');
    }

    let col = collection(getFirestore(), 'usuarios');
    addDoc(col, user);
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

  cancelarRegistro() {
    this.regPaciente = null;
    this.rol = '';
  }
}
