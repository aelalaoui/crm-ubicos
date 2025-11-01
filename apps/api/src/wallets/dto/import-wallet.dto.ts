import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ImportWalletDto {
  @ApiProperty({ example: 'My Imported Wallet' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'base58_private_key_here' })
  @IsString()
  privateKey: string;
}
