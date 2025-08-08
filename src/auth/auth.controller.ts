import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Get,
  Res,
  Patch,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { Response } from 'express';
import { UsersService } from 'src/users/users.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService,private readonly usersService:UsersService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() newUser: { username: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.register(newUser.username, newUser.password);
    const { access_token } = await this.authService.signIn(
      newUser.username,
      newUser.password,
    );
    res.cookie('jwt', access_token, {httpOnly: true, secure: false , sameSite: 'none' });
    return { message: 'User registered and logged in' };
  }

  @Post('login')
  async login(
    @Body() loginData: { username: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { access_token } = await this.authService.signIn(
      loginData.username,
      loginData.password,
    );
    res.cookie('jwt', access_token, { httpOnly: true, secure: false , sameSite: 'none'});
    return { message: 'Login successful', access_token };
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return req.user;
  }
// changes made
@UseGuards(AuthGuard)
@Patch('update')
async updateUser(
  @Request() req: any,
  @Body() updateData: { username?: string; password?: string },
  @Res({ passthrough: true }) res: Response,
) {
  const currentUsername = req.user.username;

  const updatedUser = await this.usersService.updateUser(currentUsername, updateData);

  if (!updatedUser) {
    return { message: 'User update failed', user: null };
  }

  const newUsername = updateData.username ?? currentUsername;
  const newPassword = updateData.password ?? undefined;

  const { access_token } = await this.authService.signIn(
    newUsername,
    newPassword || updatedUser.password
  );

  res.cookie('jwt', access_token, { httpOnly: true, secure: false });

  return { message: 'User updated successfully', user: updatedUser };
}
@UseGuards(AuthGuard)
@Get('favourites')
async getFavourites(@Request() req: any) {
  const user = await this.usersService.findOne(req.user.username);
  if (!user) return [];

  return user.favourites;
}

@UseGuards(AuthGuard)
@Post('favourites')
async addToFavourites(@Request() req: any, @Body() comic: any) {
  const user = await this.usersService.findOne(req.user.username);
  if (!user) return { message: 'User not found' };

  const alreadyExists = user.favourites?.some((c: any) => c.id === comic.id);
  if (!alreadyExists) {
    user.favourites.push(comic);
    await this.usersService.updateFavourites(user.username, user.favourites);
  }

  return { message: 'Added to favourites' };
}

@UseGuards(AuthGuard)
@Patch('favourites/remove')
async removeFavourite(@Request() req: any, @Body('id') comicId: number) {
  const user = await this.usersService.findOne(req.user.username);
  if (!user) return { message: 'User not found' };

  const updatedFavourites = user.favourites.filter((comic: any) => comic.id !== comicId);
  await this.usersService.updateFavourites(user.username, updatedFavourites);

  return { message: 'Removed from favourites' };
}



}
