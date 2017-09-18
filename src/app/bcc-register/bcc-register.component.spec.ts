import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BccRegisterComponent } from './bcc-register.component';

describe('BccRegisterComponent', () => {
  let component: BccRegisterComponent;
  let fixture: ComponentFixture<BccRegisterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BccRegisterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BccRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
