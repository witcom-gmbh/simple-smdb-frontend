import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SimpleServiceSearchComponent } from './simple-service-search.component';

describe('SimpleServiceSearchComponent', () => {
  let component: SimpleServiceSearchComponent;
  let fixture: ComponentFixture<SimpleServiceSearchComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SimpleServiceSearchComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SimpleServiceSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
