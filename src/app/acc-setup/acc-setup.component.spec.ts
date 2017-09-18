import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccSetupComponent } from './acc-setup.component';

describe('AccSetupComponent', () => {
  let component: AccSetupComponent;
  let fixture: ComponentFixture<AccSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
