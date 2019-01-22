import { TestBed } from '@angular/core/testing';

import { ServiceItemValidationService } from './service-item-validation.service';

describe('ServiceItemValidationService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ServiceItemValidationService = TestBed.get(ServiceItemValidationService);
    expect(service).toBeTruthy();
  });
});
