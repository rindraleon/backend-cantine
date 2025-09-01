import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { JwtService } from '@nestjs/jwt'; // Importation de JwtService pour générer des tokens
import { User } from 'src/user/entity/user.entity';
import { UserService } from 'src/user/user.service';

export class RegisterDto {
  @IsEmail({}, { message: 'Format d\'email invalide' })
  @IsNotEmpty({ message: 'L\'email est requis' })
  email: string;

  @IsString({ message: 'Le mot de passe doit être une chaîne' })
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  password: string;

  // Ajoutez d'autres champs si nécessaire (par exemple, username, etc.)
}

export class LoginDto {
  @IsEmail({}, { message: 'Format d\'email invalide' })
  @IsNotEmpty({ message: 'L\'email est requis' })
  email: string;

  @IsString({ message: 'Le mot de passe doit être une chaîne' })
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService, // Injection de UserService pour gérer les utilisateurs
    private readonly jwtService: JwtService, // Injection de JwtService pour générer des tokens
  ) {}

  // Valide les identifiants de l'utilisateur
  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Email incorrect');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new UnauthorizedException('Mot de passe incorrect');

    return user;
  }

  // Inscrit un nouvel utilisateur avec validation
  async register(data: RegisterDto): Promise<User> {
    // Validation des entrées
    if (!data.email || !data.password) {
      throw new BadRequestException('L\'email et le mot de passe sont requis');
    }

    // Nettoyage de l'email
    const sanitizedEmail = data.email.trim().toLowerCase();

    // Vérification si l'utilisateur existe déjà
    const existing = await this.userService.findByEmail(sanitizedEmail);
    if (existing) {
      throw new BadRequestException('Cet email est déjà utilisé');
    }

    // Validation de la force du mot de passe
    if (!this.isStrongPassword(data.password)) {
      throw new BadRequestException(
        'Le mot de passe doit contenir au moins 8 caractères, incluant majuscule, minuscule, chiffre et caractère spécial',
      );
    }

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(data.password, 12);

    const newUser = {
      ...data,
      email: sanitizedEmail,
      password: hashedPassword,
    };

    return this.userService.create(newUser);
  }

  // Connexion de l'utilisateur et génération du token JWT
  async login(loginDto: LoginDto): Promise<any> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    const payload = { sub: user.id, email: user.email, role: user['role'] };

    // Génération du token avec JwtService
    const token = this.jwtService.sign(payload);

    return {
      access_token: token,
      user,
    };
  }

  // Déconnexion (JWT stateless, donc gérée côté client)
  async logout(): Promise<{ message: string }> {
    return { message: 'Déconnexion réussie (client doit supprimer le token)' };
  }

  // Demande de réinitialisation de mot de passe
  async forgotPassword(email: string): Promise<{ resetToken: string }> {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new NotFoundException('Aucun compte associé à cet email');

    const payload = { sub: user.id, email: user.email };
    const resetToken = this.jwtService.sign(payload, { expiresIn: '15m' }); // Token de réinitialisation valide 15 minutes

    // En production : envoyer resetToken par email
    return { resetToken };
  }

  // Réinitialisation du mot de passe avec token valide
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    if (!token || !newPassword) {
      throw new BadRequestException('Le token et le nouveau mot de passe sont requis');
    }

    // Validation de la force du nouveau mot de passe
    if (!this.isStrongPassword(newPassword)) {
      throw new BadRequestException(
        'Le nouveau mot de passe doit contenir au moins 8 caractères, incluant majuscule, minuscule, chiffre et caractère spécial',
      );
    }

    try {
      // Vérification du token JWT
      const decoded = this.jwtService.verify(token);
      const user = await this.userService.findOne(decoded.sub);

      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      // Hachage du nouveau mot de passe
      const hashedPassword = await bcrypt.hash(newPassword, 12);
      await this.userService.update(user.id, { ...user, password: hashedPassword });

      return { message: 'Mot de passe réinitialisé avec succès' };
    } catch (err) {
      throw new BadRequestException('Token invalide ou expiré');
    }
  }

  // Fonction utilitaire pour valider la force du mot de passe
  private isStrongPassword(password: string): boolean {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumbers &&
      hasSpecialChar
    );
  }
}
