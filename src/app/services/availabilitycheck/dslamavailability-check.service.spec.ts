import { TestBed } from '@angular/core/testing';

import { DSLAMAvailabilityCheckService } from './dslamavailability-check.service';

describe('DSLAMAvailabilityCheckService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DSLAMAvailabilityCheckService = TestBed.get(DSLAMAvailabilityCheckService);
    expect(service).toBeTruthy();
  });
});
