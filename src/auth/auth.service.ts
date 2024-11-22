import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { AuthJwtPayload } from './types/auth-jwtPayload';
import refreshJwtConfig from './config/refresh-jwt.config';
import { ConfigType } from '@nestjs/config';
import * as argon2 from 'argon2';
import { CurrentUser } from './types/current-user';
import { CreateUserDto } from 'src/user/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    @Inject(refreshJwtConfig.KEY)
    private refreshTokenConfig: ConfigType<typeof refreshJwtConfig>,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) throw new UnauthorizedException('User not found!');
    const isPasswordMatch = await compare(password, user.password);
    if (!isPasswordMatch)
      throw new UnauthorizedException('Invalid credentials');

    return { id: user.id };
  }

  // async login(userId: number) {
  //   // const payload: AuthJwtPayload = { sub: userId };
  //   // const token = this.jwtService.sign(payload);
  //   // const refreshToken = this.jwtService.sign(payload, this.refreshTokenConfig);
  //   const { accessToken, refreshToken } = await this.generateTokens(userId);
  //   const hashedRefreshToken = await argon2.hash(refreshToken);
  //   await this.userService.updateHashedRefreshToken(userId, hashedRefreshToken);
  //   return {
  //     id: userId,
  //     accessToken,
  //     refreshToken,
  //   };
  // }
  // async generateTokens(userId: number) {
  //   const payload: AuthJwtPayload = { sub: userId };
  //   const [accessToken, refreshToken] = await Promise.all([
  //     this.jwtService.signAsync(payload),
  //     this.jwtService.signAsync(payload, this.refreshTokenConfig),
  //   ]);
  //   return {
  //     accessToken,
  //     refreshToken,
  //   };
  // }
  
  async generateTokens(userId: number) {
    const payload: AuthJwtPayload = { sub: userId };
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        expiresIn: '15m'  // Especifica explícitamente el tiempo de expiración
      }),
      this.jwtService.signAsync(payload, {
        secret: this.refreshTokenConfig.secret,
        expiresIn: '7d'  // Especifica explícitamente el tiempo de expiración
      }),
    ]);
    return {
      accessToken,
      refreshToken,
    };
  }

  async login(userId: number) {
    const { accessToken, refreshToken } = await this.generateTokens(userId);
    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.userService.updateHashedRefreshToken(userId, hashedRefreshToken);
    return {
      id: userId,
      accessToken,
      refreshToken,
    };
  }

  // async refreshToken(userId: number) {
  //   const { accessToken, refreshToken } = await this.generateTokens(userId);
  //   const hashedRefreshToken = await argon2.hash(refreshToken);
  //   await this.userService.updateHashedRefreshToken(userId, hashedRefreshToken);
  //   return {
  //     id: userId,
  //     accessToken,
  //     refreshToken,
  //   };
  // }
  

  async validateRefreshToken(userId: number, refreshToken: string) {
    const user = await this.userService.findOne(userId);
    if (!user || !user.hashedRefreshToken)
      throw new UnauthorizedException('Invalid Refresh Token');

    const refreshTokenMatches = await argon2.verify(
      user.hashedRefreshToken,
      refreshToken,
    );
    if (!refreshTokenMatches)
      throw new UnauthorizedException('Invalid Refresh Token');

    return { id: userId };
  }

  async signOut(userId: number) {
    await this.userService.updateHashedRefreshToken(userId, null);
  }

  async validateJwtUser(userId: number) {
    const user = await this.userService.findOne(userId);
    if (!user) throw new UnauthorizedException('User not found!');
    const currentUser: CurrentUser = { id: user.id, role: user.role };
    return currentUser;
  }

  // async validateGoogleUser(googleUser: CreateUserDto) {
  //   const user = await this.userService.findByEmail(googleUser.email);
  //   if (user) return user;
  //   return await this.userService.create(googleUser);
  // }
  async validateGoogleUser(profile: any) {
    let user = await this.userService.findByEmail(profile.email);
    
    if (!user) {
      // Crea un nuevo usuario de Google sin contraseña
      user = await this.userService.create({
        email: profile.email,
        firstName: profile.firstName,
        lastName: profile.lastName || '[Google User]',
        provider: 'google',
        googleId: profile.googleId,
        avatarUrl: profile.avatarUrl,
        password: null, // La contraseña es null para usuarios de Google
      });
    } else if (user.provider === 'google') {
      // Actualiza la información si el usuario ya existe
      user = await this.userService.update(user.id, {
        firstName: profile.firstName,
        lastName: profile.lastName || '[Google User]',
        avatarUrl: profile.avatarUrl,
      });
    }

    return user;
  }

  async refreshToken(userId: number) {
    const { accessToken, refreshToken } = await this.generateTokens(userId);
    const hashedRefreshToken = await argon2.hash(refreshToken);
    await this.userService.updateHashedRefreshToken(userId, hashedRefreshToken);
    return {
      id: userId,
      accessToken,
      refreshToken,
    };
  }
}