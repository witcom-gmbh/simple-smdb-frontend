import { TestBed } from '@angular/core/testing';

import { DslRechercheService } from './dsl-recherche.service';

describe('DslRechercheService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DslRechercheService = TestBed.get(DslRechercheService);
    expect(service).toBeTruthy();
  });
});
