import {
    Entity,
    PrimaryKey,
    Property,
  } from "@mikro-orm/core";
  
  import { ObjectType, Field, Int } from 'type-graphql'
  
  @ObjectType()
  @Entity()
  export class User {
    @Field(()=> Int)
    @PrimaryKey()
    id!: number;
  
    @Field()
    @Property({ type: "text" , unique: true })
    username!: string;
    
    @Field()
    @Property({ type: "text" , unique: true })
    email!: string;
    
    // @Field()
    @Property({ type: "text" ,})
    password!: string;
  
    @Field(()=> String)
    @Property({ type: "date" })
    createdAt: Date = new Date();
  
    @Field(()=> String)
    @Property({ type: "date", onUpdate: () => new Date() })
    updatedAt: Date = new Date();
  }
  