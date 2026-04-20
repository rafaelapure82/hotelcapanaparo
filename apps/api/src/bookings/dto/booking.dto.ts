import { IsString, IsNumber, IsDateString, IsOptional, IsEmail, MinLength, Min, Max } from 'class-validator';

export class CreateBookingDto {
  @IsNumber()
  serviceId: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(20)
  numberOfGuests?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  paymentProofUrl?: string;
}

export class UpdateBookingStatusDto {
  @IsString()
  @MinLength(1)
  status: string;
}

export class CreateExtraChargeDto {
  @IsOptional()
  @IsNumber()
  recordId?: number;

  @IsString()
  name: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  amount: number;
}
