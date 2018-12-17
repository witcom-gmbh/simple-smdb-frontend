import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SvcitemConfigComponent } from './svcitem-config.component';

describe('SvcitemConfigComponent', () => {
  let component: SvcitemConfigComponent;
  let fixture: ComponentFixture<SvcitemConfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SvcitemConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SvcitemConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
