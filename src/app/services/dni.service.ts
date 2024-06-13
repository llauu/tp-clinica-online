import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Observable, from, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DniService {
  constructor(private firestore: Firestore) { }

  TraerDni(dni: string, coleccion: string): Observable<boolean> {
    const pacientesRef = collection(this.firestore, coleccion);
    const q = query(pacientesRef, where('dni', '==', dni));
    
    // from es una función de RxJS que convierte una promesa en un Observable
    return from(getDocs(q)).pipe(
      map(snapshot => !snapshot.empty)
    );
    // Esto es necesario porque los validadores asincrónicos en Angular esperan un Observable que resuelva con los errores de validación, si los hay.
  }
}
