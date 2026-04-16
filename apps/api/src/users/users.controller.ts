import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@Request() req: any) {
    const user = await this.usersService.findOne(req.user.email);
    if (!user) return null;
    const { password, ...result } = user as any;
    return result;
  }

  @Patch('profile')
  async updateProfile(@Request() req: any, @Body() data: any) {
    const userId = req.user.userId;
    const updatedUser = await this.usersService.update(userId, {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      mobile: data.mobile,
      location: data.location,
      description: data.description,
      avatarUrl: data.avatar,
    });
    
    if (!updatedUser) return null;
    const { password, ...result } = updatedUser as any;
    return result;
  }
}
