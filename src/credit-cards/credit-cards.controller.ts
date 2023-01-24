import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CreditCardsService } from './credit-cards.service';
import { CreateCreditCardDto } from './dto/create-credit-card.dto';
import { UpdateCreditCardDto } from './dto/update-credit-card.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller('credit-cards')
export class CreditCardsController {
  constructor(private readonly creditCardsService: CreditCardsService) {}

  @UseGuards(AuthGuard('jwt'))
  @ApiExcludeEndpoint()
  @Post()
  create(@Body() createCreditCardDto: CreateCreditCardDto) {
    return this.creditCardsService.create(createCreditCardDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiExcludeEndpoint()
  @Get()
  findAll() {
    return this.creditCardsService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiExcludeEndpoint()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.creditCardsService.findOne(+id);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiExcludeEndpoint()
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCreditCardDto: UpdateCreditCardDto,
  ) {
    return this.creditCardsService.update(+id, updateCreditCardDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiExcludeEndpoint()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.creditCardsService.remove(+id);
  }
}
