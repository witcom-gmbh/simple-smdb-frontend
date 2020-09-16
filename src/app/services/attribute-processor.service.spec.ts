import { TestBed } from '@angular/core/testing';

import { AttributeProcessorService } from './attribute-processor.service';

describe('AttributeProcessorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AttributeProcessorService = TestBed.get(AttributeProcessorService);
    expect(service).toBeTruthy();
  });
});
