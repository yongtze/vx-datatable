import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NxDatatableComponent } from './nx-datatable.component';

describe('NxDatatableComponent', () => {
  let component: NxDatatableComponent;
  let fixture: ComponentFixture<NxDatatableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NxDatatableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NxDatatableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
