import { IsString, IsNumber, IsOptional, IsEmail, MinLength, Min, Max } from 'class-validator';

export class CreateReviewDto {
  @IsNumber()
  serviceId: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsString()
  @MinLength(10, { message: 'La reseña debe tener al menos 10 caracteres' })
  content: string;

  @IsNumber()
  @Min(1)
  @Max(10)
  rating: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  cleanliness?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  location?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  value?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  comfort?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  staff?: number;
}

export class RespondReviewDto {
  @IsString()
  @MinLength(5, { message: 'La respuesta debe tener al menos 5 caracteres' })
  response: string;
}
