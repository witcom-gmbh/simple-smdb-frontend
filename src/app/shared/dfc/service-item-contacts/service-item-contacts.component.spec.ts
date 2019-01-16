import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceItemContactsComponent } from './service-item-contacts.component';

describe('ServiceItemContactsComponent', () => {
  let component: ServiceItemContactsComponent;
  let fixture: ComponentFixture<ServiceItemContactsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceItemContactsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceItemContactsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
