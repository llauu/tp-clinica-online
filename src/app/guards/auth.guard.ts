import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ToastrService } from 'ngx-toastr';

export const authGuard: CanActivateFn = (route, state) => {
  const authSvc = inject(AuthService);
  const toastrSvc = inject(ToastrService);

  return new Promise((resolve)=>{  
    authSvc.isAuthenticated()
      .then((user) => {
        if(user){
          resolve(true)
        }else{
          toastrSvc.error('No estas autenticado para acceder a esta seccion.', 'Permisos insuficientes');
          resolve(false)
        }
      })
  })
};

