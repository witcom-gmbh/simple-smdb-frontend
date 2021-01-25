import { TestBed } from '@angular/core/testing';

import { ServiceAccessAvailabilityCheckService } from './service-access-availability-check.service';

describe('ServiceAccessAvailabilityCheckService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ServiceAccessAvailabilityCheckService = TestBed.get(ServiceAccessAvailabilityCheckService);
    expect(service).toBeTruthy();
  });
});
