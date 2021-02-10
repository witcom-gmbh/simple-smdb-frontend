import { TestBed } from '@angular/core/testing';

import { SmdbAccountingTypeService } from './smdb-accounting-type.service';

describe('SmdbAccountingTypeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SmdbAccountingTypeService = TestBed.get(SmdbAccountingTypeService);
    expect(service).toBeTruthy();
  });
});
