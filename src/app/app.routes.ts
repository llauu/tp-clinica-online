import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard';
import { especialistaGuard } from './guards/especialista.guard';
import { pacienteGuard } from './guards/paciente.guard';
import { pacienteEspecialistaGuard } from './guards/paciente-especialista.guard';
import { pacienteAdminGuard } from './guards/paciente-admin.guard';
import { authGuard } from './guards/auth.guard';



export const routes: Routes = [
    {path: '', redirectTo: '/bienvenida', pathMatch: 'full'},
    {path: 'bienvenida', loadComponent: () => import('./components/bienvenida/bienvenida.component').then(m => m.BienvenidaComponent)},
    {path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)},
    {path: 'register', loadComponent: () => import('./components/registro/registro.component').then(m => m.RegistroComponent)},
    {
        path: 'usuarios', loadComponent: () => import('./components/usuarios/usuarios.component').then(m => m.UsuariosComponent),
        canActivate:[adminGuard]
    },
    {
        path: 'registro-admin', loadComponent: () => import('./components/registro-admin/registro-admin.component').then(m => m.RegistroAdminComponent),
        canActivate:[adminGuard]
    },
    {
        path: 'turnos', loadComponent: () => import('./components/turnos/turnos.component').then(m => m.TurnosComponent),
        canActivate:[adminGuard]
    },
    {
        path: 'mis-turnos', loadComponent: () => import('./components/mis-turnos/mis-turnos.component').then(m => m.MisTurnosComponent),
        canActivate:[pacienteEspecialistaGuard]
    },
    {
        path: 'solicitar-turno', loadComponent: () => import('./components/solicitar-turno/solicitar-turno.component').then(m => m.SolicitarTurnoComponent),
        canActivate:[pacienteAdminGuard]
    },
    {
        path: 'mi-perfil', loadComponent: () => import('./components/mi-perfil/mi-perfil.component').then(m => m.MiPerfilComponent),
        canActivate:[authGuard]
    },
    

    
    {path: 'exito', loadComponent: () => import('./components/exito/exito.component').then(m => m.ExitoComponent)},
    {path: '**', loadComponent: () => import('./components/page-not-found/page-not-found.component').then(m => m.PageNotFoundComponent)},
];
