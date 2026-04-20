import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  // Get all reviews for a property (public)
  async findByHome(homeId: number) {
    return this.prisma.review.findMany({
      where: { serviceId: homeId, serviceType: 'home', status: 'approved' },
      include: {
        user: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Get aggregated stats for a property
  async getHomeStats(homeId: number) {
    const reviews = await this.prisma.review.findMany({
      where: { serviceId: homeId, serviceType: 'home', status: 'approved' }
    });

    if (reviews.length === 0) return { count: 0, average: 0, categories: {} };

    const avg = (field: string) => {
      const vals = reviews.map(r => (r as any)[field]).filter(v => v > 0);
      return vals.length > 0 ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : 0;
    };

    return {
      count: reviews.length,
      average: +(reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1),
      categories: {
        cleanliness: avg('cleanliness'),
        location: avg('location'),
        value: avg('value'),
        comfort: avg('comfort'),
        staff: avg('staff'),
      }
    };
  }

  // Create review — only if guest has a completed booking for this property
  async create(userId: number, data: {
    serviceId: number;
    title?: string;
    content: string;
    rating: number;
    cleanliness?: number;
    location?: number;
    value?: number;
    comfort?: number;
    staff?: number;
  }) {
    // Verify user has a completed booking for this property
    const booking = await this.prisma.booking.findFirst({
      where: {
        buyerId: userId,
        serviceId: data.serviceId,
        status: { in: ['confirmed', 'paid'] },
        endDate: { lt: new Date() } // Must have checked out
      },
      orderBy: { endDate: 'desc' }
    });

    if (!booking) {
      throw new ForbiddenException('Solo puedes dejar una reseña después de tu estadía');
    }

    // Check if user already reviewed this property
    const existing = await this.prisma.review.findFirst({
      where: { userId, serviceId: data.serviceId, serviceType: 'home' }
    });

    if (existing) {
      throw new BadRequestException('Ya has dejado una reseña para esta propiedad');
    }

    return this.prisma.review.create({
      data: {
        serviceId: data.serviceId,
        serviceType: 'home',
        userId,
        bookingId: booking.id,
        title: data.title,
        content: data.content,
        rating: Math.min(10, Math.max(1, data.rating)),
        cleanliness: data.cleanliness || 0,
        location: data.location || 0,
        value: data.value || 0,
        comfort: data.comfort || 0,
        staff: data.staff || 0,
      },
      include: {
        user: { select: { firstName: true, lastName: true } }
      }
    });
  }

  // Owner responds to a review
  async respondToReview(reviewId: number, ownerId: number, response: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: { home: { select: { authorId: true } } }
    });

    if (!review || review.home?.authorId !== ownerId) {
      throw new ForbiddenException('No tienes permiso para responder a esta reseña');
    }

    return this.prisma.review.update({
      where: { id: reviewId },
      data: { ownerResponse: response }
    });
  }

  // Admin: get all reviews for dashboard
  async findAll() {
    return this.prisma.review.findMany({
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        home: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
