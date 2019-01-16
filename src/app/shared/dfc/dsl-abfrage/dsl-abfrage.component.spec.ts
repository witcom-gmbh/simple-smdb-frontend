import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DslAbfrageComponent } from './dsl-abfrage.component';

describe('DslAbfrageComponent', () => {
  let component: DslAbfrageComponent;
  let fixture: ComponentFixture<DslAbfrageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DslAbfrageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DslAbfrageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
