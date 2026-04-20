import { Controller, Get, Post, Body, Param, Patch, UseGuards, Req } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateReviewDto, RespondReviewDto } from './dto/review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // Public: Get reviews for a property
  @Get('home/:homeId')
  findByHome(@Param('homeId') homeId: string) {
    return this.reviewsService.findByHome(+homeId);
  }

  // Public: Get review stats for a property
  @Get('home/:homeId/stats')
  getHomeStats(@Param('homeId') homeId: string) {
    return this.reviewsService.getHomeStats(+homeId);
  }

  // Authenticated: Create review (post-stay only)
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() data: CreateReviewDto, @Req() req: any) {
    return this.reviewsService.create(req.user.id, data);
  }

  // Owner: Respond to review
  @Patch(':id/respond')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'partner')
  respond(@Param('id') id: string, @Body() data: RespondReviewDto, @Req() req: any) {
    return this.reviewsService.respondToReview(+id, req.user.id, data.response);
  }

  // Admin: List all reviews
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'partner')
  findAll() {
    return this.reviewsService.findAll();
  }
}
