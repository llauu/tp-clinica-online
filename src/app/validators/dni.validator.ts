import { AbstractControl, AsyncValidatorFn, ValidationErrors } from "@angular/forms";
import { Observable, map } from "rxjs";
import { DniService } from "../services/dni.service";


export function dniExisteAsyncValidator(service: DniService, coleccion: string): AsyncValidatorFn {
    return (control: AbstractControl) => {
        const dni = control.value;
        
        return service.TraerDni(dni, coleccion).pipe(
            map(res => {
                return res ? { dniExiste: 'El DNI ya esta registrado' } : null;
            }
        ));
    };
}