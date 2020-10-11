"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResolver = void 0;
const type_graphql_1 = require("type-graphql");
const axios_1 = require("axios");
const User_1 = require("../entity/User");
let UserInput = class UserInput {
    constructor(login, email, searchedForCounter, numberOfFollowers, numberOfFollowedUsers) {
        this.login = login;
        this.email = email;
        this.searchedForCounter = searchedForCounter;
        this.followers = numberOfFollowers;
        this.followed = numberOfFollowedUsers;
    }
};
__decorate([
    type_graphql_1.Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], UserInput.prototype, "login", void 0);
__decorate([
    type_graphql_1.Field(() => String, { nullable: true }),
    __metadata("design:type", String)
], UserInput.prototype, "email", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UserInput.prototype, "searchedForCounter", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UserInput.prototype, "followers", void 0);
__decorate([
    type_graphql_1.Field(() => type_graphql_1.Int, { nullable: true }),
    __metadata("design:type", Number)
], UserInput.prototype, "followed", void 0);
UserInput = __decorate([
    type_graphql_1.InputType(),
    __metadata("design:paramtypes", [String, String, Number, Number, Number])
], UserInput);
let UserResolver = class UserResolver {
    async getUser(username, context) {
        context.logger.info(`${this.createLogMessage(context.requestId, "getUser")} Called with args: { username: ${username} }`);
        try {
            context.logger.debug(`${this.createLogMessage(context.requestId, "getUser")} sending request to <https://api.github.com/users/${username}>`);
            const response = await axios_1.default.get(`https://api.github.com/users/${username}`);
            context.logger.debug(`${this.createLogMessage(context.requestId, "getUser")} Request to <https://api.github.com/users/${username}> completed without error`);
            let userData = new UserInput(response.data.login, response.data.email, 0, response.data.followers, response.data.following);
            context.logger.debug(`${this.createLogMessage(context.requestId, "getUser")} Recieved data: ${JSON.stringify(userData)}`);
            context.logger.debug(`${this.createLogMessage(context.requestId, "getUser")} Selecting user with username: ${username} from DB}`);
            const [users, count] = await User_1.User.findAndCount({
                where: { login: username },
            });
            let user;
            // If user exists in DB
            if (count) {
                user = users[0];
                userData.searchedForCounter = user.searchedForCounter + 1;
                await User_1.User.update(user.id, userData);
                user = await User_1.User.findOne(user.id);
                context.logger.debug(`${this.createLogMessage(context.requestId, "getUser")} Updated user ${username} in DB`);
            }
            else {
                userData.searchedForCounter = 1;
                user = User_1.User.create(userData);
                await user.save();
                context.logger.debug(`${this.createLogMessage(context.requestId, "getUser")} Created user ${username} in DB`);
            }
            context.logger.info(`${this.createLogMessage(context.requestId, "getUser")} Returning user: ${JSON.stringify(user)}`);
            return user;
        }
        catch (error) {
            console.error(error);
            context.logger.error(`${this.createLogMessage(context.requestId, "getUser")} Request to <https://api.github.com/users/${username}> ended with error: ${error.message} stack: ${error.stack}`);
        }
        return null;
    }
    async deleteMostSearched(context) {
        context.logger.info(`${this.createLogMessage(context.requestId, "deleteMostSearched")} called`);
        await User_1.User.createQueryBuilder()
            .update(User_1.User)
            .set({ searchedForCounter: 0 })
            .execute();
        return true;
    }
    async mostSearched(limit, context) {
        context.logger.info(`${this.createLogMessage(context.requestId, "mostSearched")} called with args: { limit: ${limit} }`);
        const users = await User_1.User.find({
            order: { searchedForCounter: "DESC" },
            take: limit,
        });
        context.logger.info(`${this.createLogMessage(context.requestId, "mostSearched")} returning: ${JSON.stringify(users)}`);
        return users;
    }
    createLogMessage(requestId, functionName) {
        return `${new Date().toISOString()} [${requestId}] ${functionName} |`;
    }
};
__decorate([
    type_graphql_1.Mutation(() => User_1.User, { nullable: true }),
    __param(0, type_graphql_1.Arg("username", () => String)),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "getUser", null);
__decorate([
    type_graphql_1.Mutation(() => Boolean),
    __param(0, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "deleteMostSearched", null);
__decorate([
    type_graphql_1.Query(() => [User_1.User], { nullable: true }),
    __param(0, type_graphql_1.Arg("limit", () => type_graphql_1.Int)),
    __param(1, type_graphql_1.Ctx()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], UserResolver.prototype, "mostSearched", null);
UserResolver = __decorate([
    type_graphql_1.Resolver()
], UserResolver);
exports.UserResolver = UserResolver;
