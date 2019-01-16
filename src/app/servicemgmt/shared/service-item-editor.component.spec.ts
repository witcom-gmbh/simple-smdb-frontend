import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceItemEditorComponent } from './service-item-editor.component';

describe('ServiceItemEditorComponent', () => {
  let component: ServiceItemEditorComponent;
  let fixture: ComponentFixture<ServiceItemEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ServiceItemEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceItemEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
