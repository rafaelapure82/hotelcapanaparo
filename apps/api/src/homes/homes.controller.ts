import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { HomesService } from './homes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('homes')
export class HomesController {
  constructor(private readonly homesService: HomesService) {}

  @Get()
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('city') city?: string,
  ) {
    return this.homesService.findAll({
      skip: skip ? +skip : undefined,
      take: take ? +take : undefined,
      where: city ? { city: { contains: city, mode: 'insensitive' } } : {},
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.homesService.findOne(+id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() data: any, @Request() req: any) {
    return this.homesService.create({
      ...data,
      author: { connect: { id: req.user.userId } },
    });
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() data: any) {
    return this.homesService.update(+id, data);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
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
}
