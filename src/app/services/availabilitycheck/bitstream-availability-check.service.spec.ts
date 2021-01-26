import { TestBed } from '@angular/core/testing';

import { BitstreamAvailabilityCheckService } from './bitstream-availability-check.service';

describe('BitstreamAvailabilityCheckService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BitstreamAvailabilityCheckService = TestBed.get(BitstreamAvailabilityCheckService);
    expect(service).toBeTruthy();
  });
});
