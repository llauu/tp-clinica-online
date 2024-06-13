import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule, ToastrService } from 'ngx-toastr';

export const adminGuard: CanActivateFn = (route, state) => {
  const authSvc = inject(AuthService);
  const toastrSvc = inject(ToastrService);

  return new Promise((resolve)=>{  
    if(authSvc.rol == 'Admin'){
      resolve(true)
    }else{
      toastrSvc.error('Debes ser administrador para acceder a esta seccion', 'Permisos insuficientes');
      resolve(false)
    }
  })
};
