import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas.ts/schemas';


@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findOne(username: string): Promise<User | undefined> {
    const user = await this.userModel.findOne({ username }).exec();
    return user ?? undefined;
  }

  async addUser(username: string, password: string): Promise<User> {
    const newUser = new this.userModel({ username, password, favourites: [] });
    return newUser.save();
  }
  async updateUser(
  currentUsername: string,
  updateData: { username?: string; password?: string },
): Promise<User | undefined> {
  const updatedUser = await this.userModel.findOneAndUpdate(
    { username: currentUsername },
    { $set: updateData },
    { new: true }
  ).exec();

  return updatedUser ?? undefined;
}
async updateFavourites(username: string, favourites: any[]) {
  const user = await this.userModel.findOneAndUpdate(
    { username },
    { favourites },
    { new: true } // returns updated doc
  );
  return user;
}

}
