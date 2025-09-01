import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { JwtStrategy } from './strategy/jwt.strategy';
import { PassportModule } from '@nestjs/passport'; // Importation du module Passport
import { JwtModule } from '@nestjs/jwt'; // Importation du module JWT
import { ConfigModule, ConfigService } from '@nestjs/config'; // Pour gérer les variables d'environnement

@Module({
  imports: [
    ConfigModule, // Importation pour accéder aux variables d'environnement
    UserModule, // Importation du module User pour accéder à UserService
    PassportModule.register({ defaultStrategy: 'jwt' }), // Enregistrement de la stratégie JWT comme stratégie par défaut
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'secretKey123', // Récupération de la clé secrète depuis .env
        signOptions: { expiresIn: '2h' }, // Durée de validité du token
      }),
      inject: [ConfigService], // Injection de ConfigService pour accéder aux variables d'environnement
    }),
  ],
  controllers: [AuthController], // Déclaration du contrôleur d'authentification
  providers: [AuthService, JwtStrategy], // Déclaration des services et de la stratégie JWT
  exports: [AuthService, JwtStrategy], // Exportation pour utilisation dans d'autres modules
})
export class AuthModule {}
