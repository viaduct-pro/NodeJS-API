import { Injectable } from '@nestjs/common';
import { CreateInterestDto } from './dto/create-interest.dto';
import { UpdateInterestDto } from './dto/update-interest.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Interest } from '../entities/interest.entity';
import { Repository } from 'typeorm';

@Injectable()
export class InterestsService {
  constructor(
    @InjectRepository(Interest)
    private readonly interestRepository: Repository<Interest>,
  ) {}

  async create(createInterestDto: CreateInterestDto) {
    const interest = await this.interestRepository.create(createInterestDto);
    return await this.interestRepository.save(interest);
  }

  async findAll() {
    return await this.interestRepository.find();
  }

  async findDefault() {
    return await this.interestRepository.find({
      where: {
        default: true,
      },
    });
  }

  async findOne(id: number) {
    return await this.interestRepository.findOne(id);
  }

  async update(id: number, updateInterestDto: UpdateInterestDto) {
    return await this.interestRepository.update(id, updateInterestDto);
  }

  async remove(id: number) {
    const interest = await this.interestRepository.findOne(id);
    return await this.interestRepository.remove(interest);
  }
}
