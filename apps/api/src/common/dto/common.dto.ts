import { IsString, IsOptional, IsNumber, IsBoolean, MinLength, Min, IsEmail } from 'class-validator';

export class CreateHomeDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @IsOptional()
  @IsNumber()
  numberOfGuest?: number;

  @IsOptional()
  @IsNumber()
  numberOfBedrooms?: number;

  @IsOptional()
  @IsNumber()
  numberOfBathrooms?: number;

  @IsOptional()
  @IsString()
  amenities?: string;

  @IsOptional()
  @IsString()
  homeType?: string;

  @IsOptional()
  @IsString()
  gallery?: string;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;
}

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(1)
  password: string;
}
