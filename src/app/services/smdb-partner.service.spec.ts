import { TestBed } from '@angular/core/testing';

import { SmdbPartnerService } from './smdb-partner.service';

describe('SmdbPartnerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SmdbPartnerService = TestBed.get(SmdbPartnerService);
    expect(service).toBeTruthy();
  });
});
