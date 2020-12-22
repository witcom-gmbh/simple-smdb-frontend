import { TestBed } from '@angular/core/testing';

import { SmdbScriptService } from './smdb-script.service';

describe('SmdbScriptService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SmdbScriptService = TestBed.get(SmdbScriptService);
    expect(service).toBeTruthy();
  });
});
