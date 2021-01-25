import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceAccessAvailabilityCheckComponent } from './service-access-availability-check.component';

describe('ServiceAccessAvailabilityCheckComponent', () => {
  let component: ServiceAccessAvailabilityCheckComponent;
  let fixture: ComponentFixture<ServiceAccessAvailabilityCheckComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceAccessAvailabilityCheckComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceAccessAvailabilityCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
