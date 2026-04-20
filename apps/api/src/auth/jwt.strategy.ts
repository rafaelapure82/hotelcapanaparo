import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'super-secret-key', // Use env in production
    });
  }

  async validate(payload: any) {
    const userId = Number(payload.sub);
    let roles = payload.roles;

    // Fallback for stale tokens missing roles
    if (!roles || roles.length === 0) {
      const user = await this.usersService.findById(userId);
      roles = (user as any)?.roles?.map((r: any) => r.slug) || [];
    }

    return { userId, email: payload.email, roles };
  }
}
