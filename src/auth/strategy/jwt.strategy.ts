import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';

// Stratégie JWT pour valider les tokens
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService, // Injection de ConfigService pour la clé secrète
    private readonly userService: UserService, // Injection de UserService pour valider l'utilisateur
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extraction du token depuis l'en-tête Authorization
      ignoreExpiration: false, // Vérification de l'expiration du token
      secretOrKey: configService.get<string>('JWT_SECRET') || 'secretKey123', // Clé secrète depuis .env
    });
  }

  // Validation du payload JWT et retour de l'utilisateur
  async validate(payload: any) {
    const user = await this.userService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Token invalide');
    }
    return user; // L'utilisateur est attaché à request.user
  }
}
