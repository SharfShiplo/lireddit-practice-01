import {
  Entity,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";

import { ObjectType, Field, Int } from 'type-graphql'

@ObjectType()
// @ArgsType()
@Entity()
export class Post {
  @Field(()=> Int)
  @PrimaryKey()
  id!: number;

  @Field()
  @Property({ type: "text" })
  title!: string;

  @Field(()=> String)
  @Property({ type: "date" })
  createdAt: Date = new Date();

  @Field(()=> String)
  @Property({ type: "date", onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
