import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import googleOauthConfig from '../config/google-oauth.config';
import { ConfigService, ConfigType } from '@nestjs/config';
import { AuthService } from '../auth.service';

// @Injectable()
// export class GoogleStrategy extends PassportStrategy(Strategy) {
//   constructor(
//     @Inject(googleOauthConfig.KEY)
//     private googleConfiguration: ConfigType<typeof googleOauthConfig>,
//     private authService: AuthService,
//   ) {
//     super({
//       clientID: googleConfiguration.clinetID,
//       clientSecret: googleConfiguration.clientSecret,
//       callbackURL: googleConfiguration.callbackURL,
//       scope: ['email', 'profile'],
//     });
//   }

//   // async validate(
//   //   accessToken: string,
//   //   refreshToken: string,
//   //   profile: any,
//   //   done: VerifyCallback,
//   // ) {
//   //   console.log({ profile });
//   //   const user = await this.authService.validateGoogleUser({
//   //     email: profile.emails[0].value,
//   //     firstName: profile.name.givenName,
//   //     lastName: profile.name.familyName,
//   //     avatarUrl: profile.photos[0].value,
//   //     password: '',
//   //   });
//   //   // done(null, user);
//   //   return user;
//   // }
//   async validate(
//     accessToken: string,
//     refreshToken: string,
//     profile: any,
//   ): Promise<any> {
//     const { name, emails, photos } = profile;
    
//     const user = {
//       email: emails[0].value,
//       firstName: name.givenName || profile.displayName,
//       lastName: '[Google User]', // Valor predeterminado para usuarios de Google
//       profilePicture: photos?.[0]?.value,
//       provider: 'google',
//       googleId: profile.id
//     };

//     return user;
//   }
// }

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    console.log('Google Profile in Strategy:', profile);

    const user = {
      email: profile.emails[0].value,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName || '[Google User]',
      avatarUrl: profile.photos[0].value,
      googleId: profile.id,
      provider: 'google'
    };

    console.log('Transformed User Data:', user);
    return user;
  }
}