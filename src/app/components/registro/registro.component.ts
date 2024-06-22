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
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { NgxCaptchaModule } from 'ngx-captcha';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgxSpinnerModule, NgxCaptchaModule],
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
  siteKey: string = '6LelmP4pAAAAAIRCS57ZV2nSRNip3kdHbSbwIRnt';

  constructor(private firestore: Firestore, 
              private authService: AuthService, 
              private router: Router, 
              private dniService: DniService, 
              private spinner: NgxSpinnerService, 
              private toastrSvc: ToastrService) {}


  ngOnInit() {
    this.traerEspecialidades();
  }

  configReg(rol: string) {
    if(rol == 'paciente') {
      this.regPaciente = true;

      this.form = new FormGroup ({
        nombre: new FormControl('', [Validators.pattern('^[a-zA-Z]+$'), Validators.required]),
        apellido: new FormControl('', [Validators.pattern('^[a-zA-Z]+$'), Validators.required]),
        edad: new FormControl('', [Validators.required, Validators.pattern('^[0-9]+$'), Validators.min(0), Validators.max(120)]),
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
        recaptcha: new FormControl('', [Validators.required])
      });
    }
    else {
      this.regPaciente = false;

      this.form = new FormGroup ({
        nombre: new FormControl('', [Validators.pattern('^[a-zA-Z]+$'), Validators.required]),
        apellido: new FormControl('', [Validators.pattern('^[a-zA-Z]+$'), Validators.required]),
        edad: new FormControl('', [Validators.required, Validators.pattern('^[0-9]+$'), Validators.min(0), Validators.max(120)]),
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
        recaptcha: new FormControl('', [Validators.required])
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
      this.spinner.show();

      let nombre = this.form.get('nombre')!.value;
      let apellido = this.form.get('apellido')!.value;
      let edad = this.form.get('edad')!.value;
      let dni = this.form.get('dni')!.value;
      let tmp = this.regPaciente ? this.form.get('obraSocial')!.value : this.form.get('especialidad')!.value
      let mail = this.form.get('mail')!.value;
      let pass = this.form.get('pass')!.value;

      if(this.regPaciente === false) {
        this.user = {uid: 'null', nombre, apellido, edad, dni, rol: 'especialista', especialidad: tmp, mail, pass, imagenUno: '', habilitado: false};
        
        this.addNewUser(this.user); 
        this.spinner.hide();
        
        this.toastrSvc.success('Debe esperar a que un administrador habilite su cuenta para iniciar sesion.', 'Especialista registrado');
      }
      else {
        this.authService.register(mail, pass)
          .then((res: any) => {
            this.user = {uid: res, nombre, apellido, edad, dni, rol: 'paciente', obraSocial: tmp, mail, pass, imagenUno: '', imagenDos: ''};
            
            this.spinner.hide();

            this.addNewUser(this.user);
            this.toastrSvc.success('Verifica tu correo electronico para poder iniciar sesion.', 'Paciente registrado');
            this.router.navigate(['/login']);
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
    }
    else {
      this.errorMsg = 'Las contraseñas no coinciden.';
    }
  }

  
  async addNewUser(user: any) {
    if(user.rol == 'paciente') {  
      user.imagenUno = await this.saveImage(this.imagenUno, user.uid + '/imagenUno');
      user.imagenDos = await this.saveImage(this.imagenDos, user.uid + '/imagenDos');

      // let col = collection(getFirestore(), 'pacientes');
      // addDoc(col, user);
    }
    else if (user.rol == 'especialista') {
      user.imagenUno = await this.saveImage(this.imagenUno, user.uid + '/imagenUno');

      // let col = collection(getFirestore(), 'especialistas');
      // addDoc(col, user);
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
  }
}
