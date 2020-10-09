import { Field, Int, ObjectType, Root } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("text", { unique: true })
  login: string;

  @Field()
  username?(@Root() parent: User): string {
    return parent.login;
  }

  @Field(() => String, { nullable: true })
  @Column("text", { nullable: true })
  email?: string;

  @Field(() => Int)
  @Column("int", { default: 0 })
  searchedForCounter: number;

  @Field(() => Int)
  @Column("int")
  followers: number;

  @Field(() => Int)
  @Column("int")
  followed: number;
}
