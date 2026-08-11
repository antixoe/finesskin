import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('uses the configured API base URL for sign-in requests', () => {
    Object.assign(environment, { apiBaseUrl: '/custom-api' });

    service.signIn('user@example.com', 'secret').subscribe();

    const req = httpMock.expectOne('/custom-api/auth/signin');
    expect(req.request.method).toBe('POST');
    req.flush({
      token: 'abc',
      user: {
        id: '1',
        name: 'Test User',
        email: 'user@example.com',
        role: 'USER',
        permissions: [],
        avatarUrl: null,
      },
    });
  });
});
