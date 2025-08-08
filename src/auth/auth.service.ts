import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signIn(username: string, password: string): Promise<{ access_token: string }> {
    const user = await this.usersService.findOne(username);
    if (!user || user.password !== password) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { username };
    const access_token = await this.jwtService.signAsync(payload);
    return { access_token };
  }
  async register(username: string, password: string): Promise<void> {
    const existingUser = await this.usersService.findOne(username);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }
    await this.usersService.addUser(username, password);
  }
}
