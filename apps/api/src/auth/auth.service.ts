import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { 
      email: user.email, 
      sub: user.id,
      roles: user.roles?.map((r: any) => r.slug) || [],
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: payload.roles,
      }
    };
  }

  async register(data: any) {
    try {
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await this.usersService.create({
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        roles: {
          connect: [{ slug: 'guest' }]
        }
      });
      
      // Auto-login after registration
      return this.login(user);
    } catch (error) {
      console.error('Registration error:', error);
      if (error.code === 'P2002') {
        throw new UnauthorizedException('El correo electrónico ya está registrado');
      }
      if (error.code === 'P2025') {
        throw new Error('Error de configuración del sistema: Role "guest" no encontrado. Por favor ejecute el seed.');
      }
      throw error;
    }
  }
}

