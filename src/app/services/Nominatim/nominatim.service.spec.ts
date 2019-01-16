import { TestBed } from '@angular/core/testing';

import { NominatimService } from './nominatim.service';

describe('NominatimService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NominatimService = TestBed.get(NominatimService);
    expect(service).toBeTruthy();
  });
});
