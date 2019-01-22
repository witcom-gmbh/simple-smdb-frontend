import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServicePriceComponent } from './service-price.component';

describe('ServicePriceComponent', () => {
  let component: ServicePriceComponent;
  let fixture: ComponentFixture<ServicePriceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServicePriceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServicePriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
