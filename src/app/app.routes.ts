import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard';

export const routes: Routes = [
    {path: '', redirectTo: '/bienvenida', pathMatch: 'full'},
    {path: 'bienvenida', loadComponent: () => import('./components/bienvenida/bienvenida.component').then(m => m.BienvenidaComponent)},
    {path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)},
    {path: 'register', loadComponent: () => import('./components/registro/registro.component').then(m => m.RegistroComponent)},
    {
        path: 'usuarios', loadComponent: () => import('./components/usuarios/usuarios.component').then(m => m.UsuariosComponent),
        canActivate:[adminGuard]
    },
    
    {path: '**', loadComponent: () => import('./components/page-not-found/page-not-found.component').then(m => m.PageNotFoundComponent)},
];
