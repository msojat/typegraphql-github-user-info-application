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
import { createLogMessage } from "../utils/LogUtil";

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
    context.logger.info(
      createLogMessage({ requestId: context.requestId, functionName: "getUser", 
      message: `Called with args: { username: ${username} }`})
    );
    try {
      context.logger.debug(
        createLogMessage({ requestId: context.requestId, functionName: "getUser", 
        message: `Sending request to <https://api.github.com/users/${username}>`})
      );
      // Request data from GitHub API
      const response = await axios.get(
        `https://api.github.com/users/${username}`
      );
      context.logger.debug(
        createLogMessage({ requestId: context.requestId, functionName: "getUser", 
        message: `Request to <https://api.github.com/users/${username}> completed without error`})
      );
      let userData = new UserInput(
        response.data.login,
        response.data.email,
        0,
        response.data.followers,
        response.data.following
      );
      context.logger.debug(
        createLogMessage({ requestId: context.requestId, functionName: "getUser",
          message: `Recieved data: ${JSON.stringify(userData)}`})
      );

      context.logger.debug(
        createLogMessage({ requestId: context.requestId, functionName: "getUser",
          message: `Selecting user with username: ${username} from DB`})
      );
      const [users, count] = await User.findAndCount({
        where: { login: username },
      });
      let user: User;
      // If user exists in DB, update it, else create new
      if (count) {
        user = users[0];
        userData.searchedForCounter = user.searchedForCounter + 1;
        await User.update(user.id, userData);
        user = await User.findOne(user.id);
        context.logger.debug(
          createLogMessage({ requestId: context.requestId, functionName: "getUser", message: `Updated user ${username} in DB`})
        );
      } else {
        userData.searchedForCounter = 1;
        user = User.create(userData);
        await user.save();
        context.logger.debug(
          createLogMessage({ requestId: context.requestId, functionName: "getUser", message: `Created user ${username} in DB`})
        );
      }

      context.logger.info(
        createLogMessage({ requestId: context.requestId, functionName: "getUser", 
        message: `Returning user: ${JSON.stringify(user)}`})
      );
      return user;
    } catch (error) {
      console.error(error);
      context.logger.error(
        createLogMessage({ requestId: context.requestId, functionName: "getUser",
          message: `Request to <https://api.github.com/users/${username}> ended with error: ${error.message} stack: ${error.stack}`})
      );
    }
    return null;
  }

  @Mutation(() => Boolean)
  async deleteMostSearched(@Ctx() context: Context): Promise<boolean> {
    context.logger.info(
      createLogMessage({ requestId: context.requestId, functionName: "deleteMostSearched", message: `called`})
    );
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
    context.logger.info(
      createLogMessage({ requestId: context.requestId, functionName: "mostSearched", message: `Called with args: { limit: ${limit} }`})
    );
    const users: User[] = await User.find({
      order: { searchedForCounter: "DESC" },
      take: limit,
    });
    context.logger.info(
      createLogMessage({ requestId: context.requestId, functionName: "mostSearched", message: `Returning: ${JSON.stringify(users)}`})
    );
    return users;
  }
}
