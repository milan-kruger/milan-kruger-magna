import { Role } from './roles';

/**
 * Represents a user role with enabled status
 * This type extends the role information from the backend
 * to include whether the role is enabled for feature visibility control
 */
export interface UserRoleInfo {
  role: string; // Full role name with ROLE_ prefix (e.g., "ROLE_RTQSTRANSGRESSION_VIEW")
  enabled: boolean; // Whether this role is enabled
}

export interface EnhancedUserGroup {
  id?: number;
  userGroupName?: string;
  userGroupDescription?: string;
  roles?: UserRoleInfo[];
  userGroupTypes?: ('CENTRAL' | 'WEIGHSTATION' | 'TCM')[];
}

export const FEATURE_ROLE_MAPPING = {
  RTQS_TRANSGRESSIONS: [
    'RTQSTRANSGRESSION_MAINTAIN',
    'RTQSTRANSGRESSION_VIEW'
  ] as Role[],
  SUBMISSION_AND_ADJUDICATION: [
    'SUBMISSION_VIEW',
    'REGISTERSUBMISSION_MAINTAIN',
    'ADJUDICATION_MAINTAIN'
  ] as Role[],
  COURT: [
    'COURT_VIEW',
    'COURTREGISTER_MAINTAIN'
  ] as Role[],
  WARRANT_OF_ARREST: [
    'WARRANTOFARREST_MAINTAIN',
    'WARRANTOFARREST_VIEW',
    'WARRANTOFARRESTREGISTER_MAINTAIN',
    'WARRANTOFARRESTREGISTER_VIEW'
  ] as Role[],
  AARTO_MANAGEMENT: [
    'AARTONOTICENUMBER_MAINTAIN'
  ] as Role[]
} as const;

export type FeatureName = keyof typeof FEATURE_ROLE_MAPPING;
