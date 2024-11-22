import { registerAs } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';

// export default registerAs(
//   'jwt',
//   (): JwtModuleOptions => ({
//     secret: process.env.JWT_SECRET,
//     signOptions: {
//       expiresIn: '1d',
//     },
//   }),
// );
export default registerAs('refreshJwt', () => ({
  secret: process.env.REFRESH_JWT_SECRET || process.env.JWT_SECRET,
  signOptions: {
    expiresIn: '7d'
  }
}));