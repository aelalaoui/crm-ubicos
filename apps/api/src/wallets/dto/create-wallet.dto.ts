import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWalletDto {
  @ApiProperty({ example: 'My Trading Wallet' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;
}
