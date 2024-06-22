import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';

export const pacienteAdminGuard: CanActivateFn = (route, state) => {
  const authSvc = inject(AuthService);
  const toastrSvc = inject(ToastrService);

  return new Promise((resolve)=>{  
    if(authSvc.rol == 'paciente' || authSvc.rol == 'admin'){
      resolve(true)
    }else{
      toastrSvc.error('No tienes permiso para acceder a esta seccion.', 'Permisos insuficientes');
      resolve(false)
    }
  })
};
