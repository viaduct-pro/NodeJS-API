import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guards';

export const Auth = () => UseGuards(JwtAuthGuard);
