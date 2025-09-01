import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

// Garde pour le contrôle d'accès basé sur les rôles
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Récupération des rôles requis depuis les métadonnées
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si aucun rôle n'est requis, autoriser l'accès
    if (!requiredRoles) {
      return true;
    }

    // Récupération de l'utilisateur depuis la requête (défini par JwtStrategy)
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Vérification si l'utilisateur existe et a un rôle
    if (!user || !user.role) {
      throw new UnauthorizedException('Rôle de l\'utilisateur non trouvé');
    }

    // Vérification si le rôle de l'utilisateur correspond à l'un des rôles requis
    return requiredRoles.includes(user.role);
  }
}
