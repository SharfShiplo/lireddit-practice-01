import { Resolver, Mutation, InputType, Field, Arg, Ctx, ObjectType } from "type-graphql";
import { MyContext } from "src/types";
import { User } from "../entities/User";
import argon2 from 'argon2';

@InputType()
class UsernamePasswordInput {
    @Field()
    username: string;
    @Field()
    password: string;
}

@ObjectType()
class FieldError {
    @Field()
    field: string;

    @Field()
    message: string;
}

@ObjectType()
class UserResponse {
    @Field(()=> [FieldError], {nullable: true})
    errors?: FieldError[];

    @Field(()=> User, {nullable: true})
    user?: User;
}

@Resolver()
export class UserResolver {

    @Mutation(()=> UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { em }: MyContext,
    ): Promise<UserResponse>{
        // dummy error response
        if(options.username.length <= 2){
            return {
                errors: [
                    {
                        field: 'username',
                        message: 'Length must be greater than 2 characters'
                    }
                ]
            }
        }
        const hashedPasswords = await argon2.hash(options.password)
        const user = em.create(User, {
            username: options.username,
            password: hashedPasswords,
            createdAt: "",
            updatedAt: ""
        })

        try {

            await em.persistAndFlush(user)
        } catch (err){
            // console.log(err)
            // err.code / err.detail one of them should be fine
            if(err.code === '23505' || err.detail.includes('already exists')){
                return {
                    errors: [
                        {
                            field: 'username',
                            message: 'Username already taken'
                        }
                    ]
                }
            }
        }

        return {user};
    }
    
    @Mutation(()=> UserResponse)
    async login(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { em }: MyContext,
    ): Promise<UserResponse>{
        const user = await em.findOne(User, {username: options.username})
        if(!user) {
            return { 
                errors: [{
                    field: "username",
                    message: "That username doesn't exist"
                }]

            }
        }
        const valid = await argon2.verify(user.password, options.password);
        if(!valid) {
            return { 
                errors: [{
                    field: "password",
                    message: "Incorrect Password"
                }]

            }
        }

        return {user};
    }
}