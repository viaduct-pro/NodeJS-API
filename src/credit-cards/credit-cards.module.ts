import { Module } from '@nestjs/common';
import { CreditCardsService } from './credit-cards.service';
import { CreditCardsController } from './credit-cards.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditCard } from '../entities/credit-card.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CreditCard])],
  controllers: [CreditCardsController],
  providers: [CreditCardsService],
})
export class CreditCardsModule {}
