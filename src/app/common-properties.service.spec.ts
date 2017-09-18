import { TestBed, inject } from '@angular/core/testing';

import { CommonPropertiesService } from './common-properties.service';

describe('CommonPropertiesService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CommonPropertiesService]
    });
  });

  it('should be created', inject([CommonPropertiesService], (service: CommonPropertiesService) => {
    expect(service).toBeTruthy();
  }));
});
