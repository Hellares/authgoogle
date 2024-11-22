import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from './guards/local-auth/local-auth.guard';
import { RefreshAuthGuard } from './guards/refresh-auth/refresh-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { Public } from './decorators/public.decorator';
import { GoogleAuthGuard } from './guards/google-auth/google-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user.id);
  }

  @UseGuards(RefreshAuthGuard)
  @Post('refresh')
  refreshToken(@Req() req) {
    return this.authService.refreshToken(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('signout')
  signOut(@Req() req) {
    this.authService.signOut(req.user.id);
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/login')
  googleLogin() {}

  // @Public()
  // @UseGuards(GoogleAuthGuard)
  // @Get('google/callback')
  // async googleCallback(@Req() req, @Res() res) {
  //   const response = await this.authService.login(req.user.id);
  //   res.redirect(`http://localhost:5173?token=${response.accessToken}`);
  // }
  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleCallback(@Req() req, @Res() res) {
    try {
      // Loguea el perfil de usuario que viene de Google
      console.log('Google Profile:', req.user);

      // Valida y crea/actualiza el usuario
      const user = await this.authService.validateGoogleUser(req.user);
      console.log('Validated User:', user);

      // Genera los tokens
      const { accessToken, refreshToken } = await this.authService.login(user.id);
      console.log('Generated Tokens:', { accessToken, refreshToken });

      // Por ahora, responde con JSON para probar
      return res.json({
        success: true,
        user,
        tokens: {
          accessToken,
          refreshToken
        }
      });
    } catch (error) {
      console.error('Error in googleCallback:', error);
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

}