import mongoose from "mongoose";
import { create } from "node:domain";
import { type } from "node:os";

const UserSchema = new mongoose.Schema({
    name: {type:String,required : true},
    email : {type:String,required : true,unique:true},
    password :{type:String,required : true},
    role:{type:String,enum:["user,admin"], default:"user"},
    createAt:{type:Date,default:Date.now},
});

export default mongoose.model.User || mongoose.model("User",UserSchema);