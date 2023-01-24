import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from 'src/entities/role.entity';
import { Repository } from 'typeorm';
import { RoleDto } from './dto/role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}
  async getRoles() {
    return await this.roleRepository.find();
  }

  async create(roleDto: RoleDto) {
    const { name } = roleDto;
    // console.log(name);

    const existingRole = await this.roleRepository.findOne({ name });
    if (existingRole) {
      return existingRole;
    }

    const data = this.roleRepository.create({ name });

    return this.roleRepository.save(data);
  }
}
