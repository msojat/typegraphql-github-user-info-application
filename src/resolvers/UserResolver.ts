import {
  Arg,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";
import axios from "axios";
import { User } from "../entity/User";
import { Context } from "vm";

@InputType()
class UserInput {
  constructor(
    login: string,
    email: string,
    searchedForCounter: number,
    numberOfFollowers: number,
    numberOfFollowedUsers: number
  ) {
    this.login = login;
    this.email = email;
    this.searchedForCounter = searchedForCounter;
    this.followers = numberOfFollowers;
    this.followed = numberOfFollowedUsers;
  }

  @Field(() => String, { nullable: true })
  login?: string;

  @Field(() => String, { nullable: true })
  email?: string;

  @Field(() => Int, { nullable: true })
  searchedForCounter?: number;

  @Field(() => Int, { nullable: true })
  followers?: number;

  @Field(() => Int, { nullable: true })
  followed?: number;
}

@Resolver()
export class UserResolver {
  @Mutation(() => User, { nullable: true })
  async getUser(
    @Arg("username", () => String) username: string,
    @Ctx() context: Context
  ): Promise<User> | null {
    try {
      const response = await axios.get(
        `https://api.github.com/users/${username}`
      );
      response.data;
      let userData = new UserInput(
        response.data.login,
        response.data.email,
        0,
        response.data.followers,
        response.data.following
      );

      const [users, count] = await User.findAndCount({
        where: { login: username },
      });
      let user: User;
      // If user exists in DB
      if (count) {
        user = users[0];
        userData.searchedForCounter = user.searchedForCounter + 1;
        await User.update(user.id, userData);
        user = await User.findOne(user.id);
      } else {
        userData.searchedForCounter = 1;
        user = User.create(userData);
        await user.save();
      }

      return user;
    } catch (error) {
      console.error(error);
    }
    return null;
  }

  @Mutation(() => Boolean)
  async deleteMostSearched(@Ctx() context: Context): Promise<boolean> {
    await User.createQueryBuilder()
      .update(User)
      .set({ searchedForCounter: 0 })
      .execute();
    return true;
  }

  @Query(() => [User], { nullable: true })
  async mostSearched(
    @Arg("limit", () => Int) limit: number,
    @Ctx() context: Context
  ): Promise<User[]> | null {
    context.logger.info(`Request ID is: ${context.requestId}`);
    return await User.find({
      order: { searchedForCounter: "DESC" },
      take: limit,
    });
  }
}
