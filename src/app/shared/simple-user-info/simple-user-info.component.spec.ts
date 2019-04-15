import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleUserInfoComponent } from './simple-user-info.component';

describe('SimpleUserInfoComponent', () => {
  let component: SimpleUserInfoComponent;
  let fixture: ComponentFixture<SimpleUserInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SimpleUserInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleUserInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
