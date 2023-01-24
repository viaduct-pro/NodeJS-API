import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { RoleDto } from './dto/role.dto';
import { RolesService } from './roles.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('/')
  getRoles() {
    return this.rolesService.getRoles();
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('/')
  createRole(@Body() roleDto: RoleDto) {
    return this.rolesService.create(roleDto);
  }
}
