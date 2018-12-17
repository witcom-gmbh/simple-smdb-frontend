import { TestBed } from '@angular/core/testing';

import { ServiceItemServiceService } from './service-item-service.service';

describe('ServiceItemServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ServiceItemServiceService = TestBed.get(ServiceItemServiceService);
    expect(service).toBeTruthy();
  });
});
