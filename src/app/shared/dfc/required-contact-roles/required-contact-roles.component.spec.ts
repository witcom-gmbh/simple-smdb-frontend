import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RequiredContactRolesComponent } from './required-contact-roles.component';

describe('RequiredContactRolesComponent', () => {
  let component: RequiredContactRolesComponent;
  let fixture: ComponentFixture<RequiredContactRolesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RequiredContactRolesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RequiredContactRolesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
