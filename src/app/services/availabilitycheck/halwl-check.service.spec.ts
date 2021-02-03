import { TestBed } from '@angular/core/testing';

import { HALwlCheckService } from './halwl-check.service';

describe('HALwlCheckService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HALwlCheckService = TestBed.get(HALwlCheckService);
    expect(service).toBeTruthy();
  });
});
