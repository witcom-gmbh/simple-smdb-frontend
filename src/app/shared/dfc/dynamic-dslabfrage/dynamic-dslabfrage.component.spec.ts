import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicDSLAbfrageComponent } from './dynamic-dslabfrage.component';

describe('DynamicDSLAbfrageComponent', () => {
  let component: DynamicDSLAbfrageComponent;
  let fixture: ComponentFixture<DynamicDSLAbfrageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DynamicDSLAbfrageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DynamicDSLAbfrageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
