import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TestInstantiateComponent } from './test-instantiate.component';

describe('TestInstantiateComponent', () => {
  let component: TestInstantiateComponent;
  let fixture: ComponentFixture<TestInstantiateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TestInstantiateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestInstantiateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
