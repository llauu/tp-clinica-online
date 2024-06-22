import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { pacienteEspecialistaGuard } from './paciente-especialista.guard';

describe('pacienteEspecialistaGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => pacienteEspecialistaGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
