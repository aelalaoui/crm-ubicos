import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { WalletsService } from './wallets.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { ImportWalletDto } from './dto/import-wallet.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('wallets')
@Controller('wallets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new wallet' })
  @ApiResponse({ status: 201, description: 'Wallet created successfully' })
  create(
    @CurrentUser('id') userId: string,
    @Body() createWalletDto: CreateWalletDto,
  ) {
    return this.walletsService.create(userId, createWalletDto);
  }

  @Post('import')
  @ApiOperation({ summary: 'Import an existing wallet' })
  @ApiResponse({ status: 201, description: 'Wallet imported successfully' })
  import(
    @CurrentUser('id') userId: string,
    @Body() importWalletDto: ImportWalletDto,
  ) {
    return this.walletsService.import(userId, importWalletDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user wallets' })
  @ApiResponse({ status: 200, description: 'Wallets retrieved successfully' })
  findAll(@CurrentUser('id') userId: string) {
    return this.walletsService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get wallet by ID' })
  @ApiResponse({ status: 200, description: 'Wallet retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.walletsService.findOne(id, userId);
  }

  @Get(':id/balance')
  @ApiOperation({ summary: 'Get wallet balance' })
  @ApiResponse({ status: 200, description: 'Balance retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  getBalance(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.walletsService.getBalance(id, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete wallet' })
  @ApiResponse({ status: 200, description: 'Wallet deleted successfully' })
  @ApiResponse({ status: 404, description: 'Wallet not found' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.walletsService.delete(id, userId);
  }
}
