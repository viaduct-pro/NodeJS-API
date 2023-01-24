import { Injectable } from '@nestjs/common';
import { CreateCreditCardDto } from './dto/create-credit-card.dto';
import { UpdateCreditCardDto } from './dto/update-credit-card.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CreditCard } from '../entities/credit-card.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CreditCardsService {
  constructor(
    @InjectRepository(CreditCard)
    private readonly creditCardRepository: Repository<CreditCard>,
  ) {}

  async create(createCreditCardDto: CreateCreditCardDto) {
    return this.creditCardRepository.create(createCreditCardDto);
  }

  async findAll() {
    return this.creditCardRepository.find();
  }

  async findOne(id: number) {
    return this.creditCardRepository.findOne(id);
  }

  async update(id: number, updateCreditCardDto: UpdateCreditCardDto) {
    return this.creditCardRepository.update(id, updateCreditCardDto);
  }

  async remove(id: number) {
    const creditCard = await this.creditCardRepository.findOne(id);

    return this.creditCardRepository.remove(creditCard);
  }
}
