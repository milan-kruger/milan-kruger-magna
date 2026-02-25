import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import useGeneratedMenuItems from '../../components/app-bar/menuItems';

vi.mock('../../../framework/auth/authService', async () => {
  return {
    default: {
      hasRole: vi.fn(),
      isFeatureEnabled: vi.fn(),
    },
  };
});

const mockedAuthService = await import('../../../framework/auth/authService');

describe('useGeneratedMenuItems', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.resetAllMocks();

    // Default: all features enabled
    mockedAuthService.default.isFeatureEnabled = vi.fn(() => true);
  });

  const setPathname = (pathname: string) => {
    window.history.pushState({}, '', pathname);
  };

  it('should include transgressions menu item when user has TRANSGRESSIONDETAILS_VIEW and not on prosecuteTransgression page', () => {
    mockedAuthService.default.hasRole = vi.fn((role: string) => role === 'TRANSGRESSIONDETAILS_VIEW');
    setPathname('/some-page');

    const { result } = renderHook(() => useGeneratedMenuItems());

    expect(result.current.some(item => item.title === 'transgressions')).toBe(true);
  });

  it('should include disabled captureTransgression menu item when on prosecuteTransgression page', () => {
    mockedAuthService.default.hasRole = vi.fn((role: string) => role === 'TRANSGRESSIONDETAILS_VIEW');
    setPathname('/prosecuteTransgression/123');

    const { result } = renderHook(() => useGeneratedMenuItems());

    const captureItem = result.current.find(item => item.title === 'captureTransgression');
    expect(captureItem).toBeDefined();
    expect(captureItem?.disabled).toBe(true);
  });

  it('should include submissionAndAdjudication if all submission roles present and Submission and Adjudication is enabled', () => {
    mockedAuthService.default.hasRole = vi.fn((role: string) =>
      ['SUBMISSIONDETAILS_VIEW', 'REGISTERSUBMISSION_MAINTAIN', 'SUBMISSION_VIEW'].includes(role)
    );
    setPathname('/some-other');

    const { result } = renderHook(() => useGeneratedMenuItems());
    expect(result.current.some(item => item.title === 'submissionAndAdjudication')).toBe(true);
  });

  it('should include court if COURT_VIEW and COURTREGISTER_MAINTAIN present and Court is enabled', () => {
    mockedAuthService.default.hasRole = vi.fn((role: string) =>
      ['COURT_VIEW', 'COURTREGISTER_MAINTAIN'].includes(role)
    );
    setPathname('/another-page');

    const { result } = renderHook(() => useGeneratedMenuItems());
    expect(result.current.some(item => item.title === 'court')).toBe(true);
  });

  it('should include warrantOfArrest if any relevant role is present and Warrant of Arrest is enabled', () => {
    mockedAuthService.default.hasRole = vi.fn((role: string) =>
      ['WARRANTOFARRESTREGISTER_MAINTAIN'].includes(role)
    );
    setPathname('/warrants');

    const { result } = renderHook(() => useGeneratedMenuItems());
    expect(result.current.some(item => item.title === 'warrantOfArrest')).toBe(true);
  });

  it('should include manualPayments if both roles are present', () => {
    mockedAuthService.default.hasRole = vi.fn((role: string) =>
      ['MANUALPAYMENT_MAINTAIN', 'MANUALPAYMENT_VIEW'].includes(role)
    );
    setPathname('/manual');

    const { result } = renderHook(() => useGeneratedMenuItems());
    expect(result.current.some(item => item.title === 'manualPayments')).toBe(true);
  });

  it('should not display all menu items (submissionAndAdjudication, court, warrantOfArrest) when features are disabled', () => {
    // Mock all features as disabled
    mockedAuthService.default.isFeatureEnabled = vi.fn(() => false);

    mockedAuthService.default.hasRole = vi.fn((role: string) =>
      ['COURT_VIEW', 'COURTREGISTER_MAINTAIN'].includes(role)
    );
    setPathname('/some-page');

    const { result } = renderHook(() => useGeneratedMenuItems());
    expect(result.current.some(item => item.title === 'court')).toBe(false);
    expect(result.current.some(item => item.title === 'submissionAndAdjudication')).toBe(false);
    expect(result.current.some(item => item.title === 'warrantOfArrest')).toBe(false);
  });
});
