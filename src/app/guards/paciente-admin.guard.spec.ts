import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { pacienteAdminGuard } from './paciente-admin.guard';

describe('pacienteAdminGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => pacienteAdminGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
