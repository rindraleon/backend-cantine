
import { SetMetadata } from '@nestjs/common';

// Key for storing roles metadata
export const ROLES_KEY = 'roles';

// Custom decorator to set required roles for a route
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);