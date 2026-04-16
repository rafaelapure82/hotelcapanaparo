import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { HomesService } from './homes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('homes')
export class HomesController {
  constructor(private readonly homesService: HomesService) {}

  @Get()
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('city') city?: string,
    @Query('featured') featured?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('search') search?: string,
    @Query('orderBy') orderBy?: string,
  ) {
    const where: any = { status: 'publish' };
    
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (featured === 'true') where.isFeatured = true;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }
    
    if (minPrice || maxPrice) {
      where.basePrice = {};
      if (minPrice) where.basePrice.gte = +minPrice;
      if (maxPrice) where.basePrice.lte = +maxPrice;
    }

    let sort: any = { createdAt: 'desc' };
    if (orderBy === 'price_asc') sort = { basePrice: 'asc' };
    if (orderBy === 'price_desc') sort = { basePrice: 'desc' };
    if (orderBy === 'popular') sort = { viewCount: 'desc' };

    return this.homesService.findAll({
      skip: skip ? +skip : undefined,
      take: take ? +take : undefined,
      where,
      orderBy: sort,
    });
  }


  @Get(':id')
  async findOne(@Param('id') id: string) {
    // Increment view count when a property is viewed
    await this.homesService.update(+id, {
      viewCount: { increment: 1 }
    });
    return this.homesService.findOne(+id);
  }


  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'partner')
  async create(@Body() data: any, @Request() req: any) {
    const slug = data.title
      .toLowerCase()
      .replace(/ /g, '-')
      .replace(/[^\w-]+/g, '') + '-' + Date.now().toString().slice(-4);

    return this.homesService.create({
      ...data,
      slug,
      author: { connect: { id: req.user.userId } },
    });
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'partner')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.homesService.update(+id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'partner')
  async remove(@Param('id') id: string) {
    return this.homesService.remove(+id);
  }


  @Get(':id/availability')
  async checkAvailability(
    @Param('id') id: string,
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return this.homesService.checkAvailability(+id, new Date(start), new Date(end));
  }

  @Get('calendar/data')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'partner')
  async getCalendarData() {
    return this.homesService.getCalendarData();
  }
}
