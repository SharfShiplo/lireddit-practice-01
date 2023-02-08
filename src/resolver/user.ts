import { Resolver, Mutation, Field, Arg, Ctx, ObjectType } from "type-graphql";
import { MyContext } from "src/types";
import { User } from "../entities/User";
import argon2 from "argon2";
import { EntityManager } from "@mikro-orm/postgresql";
import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/send-email";
import {v4} from 'uuid'
import { FORGET_PASSWORD_PREFIX } from "../constants";

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Mutation(()=>Boolean)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() {em}: MyContext,
  ){
    const user = await em.findOne(User, { email });
    if(!user) {
      // the email is not in the database
      return true;
    }

    const token = v4();
    // once we set the redis then we can do like 
    // Redis.set(FORGET_PASSWORD_PREFIX + token, user.id, 'ex', 1000 * 60 * 60 * 24 * 3) // 3 days
    // for now:
    const link = FORGET_PASSWORD_PREFIX + token + "_" + user.id;

    await sendEmail(user.email, `<a href="http://localhost:3000/${link}">Reset Password</a>`)

    return true;
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors) {
      return { errors };
    }

    const hashedPasswords = await argon2.hash(options.password);
    let user;
    try {
      const result = await (em as EntityManager)
        .createQueryBuilder(User)
        .getKnexQuery()
        .insert({
          username: options.username,
          email: options.email,
          password: hashedPasswords,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning("*");
      user = result[0];
    } catch (err) {
      // console.log(err)
      // err.code / err.detail one of them should be fine
      if (err.code === "23505" || err.detail.includes("already exists")) {
        return {
          errors: [
            {
              field: "username",
              message: "Username already taken",
            },
          ],
        };
      }
    }

    return { user };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { em }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(
      User,
      usernameOrEmail.includes("@")
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail }
    );
    if (!user) {
      return {
        errors: [
          {
            field: "usernameOrEmail",
            message: "That User doesn't exist",
          },
        ],
      };
    }
    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return {
        errors: [
          {
            field: "password",
            message: "Incorrect Password",
          },
        ],
      };
    }

    return { user };
  }

  @Mutation(() => Boolean)
  //   logout(@Ctx() { req, res }: MyContext) {
  logout() {
    return new Promise((resolve) => {
      // if we were implemented the session then it would be better like
      // res.clearCookie("qid"); // clear the cookie form the browser
      // req.session.destroy((err)=>{
      //     if(err){
      //         console.log(err)
      //         resolve(false)
      //         return
      //     }
      //     resolve(true)
      // });
      resolve(true);
    });
  }
}
