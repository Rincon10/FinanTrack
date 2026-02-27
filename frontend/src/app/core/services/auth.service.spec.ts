import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AuthService]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return false when not authenticated', () => {
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('should login and store token', () => {
    const mockResponse = {
      success: true,
      data: {
        accessToken: 'test-token',
        refreshToken: 'refresh-token',
        tokenType: 'Bearer',
        expiresIn: 86400000,
        user: {
          id: 1,
          email: 'test@example.com',
          fullName: 'Test User',
          preferredCurrency: 'COP',
          preferredLocale: 'es'
        }
      }
    };

    service.login({ email: 'test@example.com', password: 'password' }).subscribe(res => {
      expect(res.data.accessToken).toBe('test-token');
      expect(service.isAuthenticated()).toBeTrue();
      expect(service.getToken()).toBe('test-token');
    });

    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should clear token on logout', () => {
    localStorage.setItem('access_token', 'some-token');
    service.logout();
    expect(service.isAuthenticated()).toBeFalse();
    expect(service.getToken()).toBeNull();
  });
});
