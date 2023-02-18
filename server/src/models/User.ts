import { Schema, model } from "mongoose"

type UserType = {
    name: string,
    email: string,
    password: string,
}

const UserSchema = new Schema<UserType>({
    name: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
})

const User = model<UserType>('user', UserSchema) // User model created

export default User