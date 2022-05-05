import { TestBed } from '@angular/core/testing';

import { ShyrkaService } from './shyrka.service';

describe('ShyrkaService', () => {
  let service: ShyrkaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShyrkaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
