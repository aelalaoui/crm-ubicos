import { IsString, IsObject, IsOptional, IsBoolean } from 'class-validator';

export class CreateStrategyDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsObject()
  config: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateStrategyDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  config?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
