import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import {User} from "../users/user.schema";

export type FileDocument = File & Document;

@Schema()
export class File {

    @Prop({required: true})
    name: string;

    @Prop({required: true})
    type: string;

    @Prop()
    accessLink: string;

    @Prop({default: 0})
    size: number;

    @Prop({default: ""})
    path: string;

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: "User"})
    user: User;

    @Prop({type: mongoose.Schema.Types.ObjectId, ref: "File"})
    parent: File;

    @Prop({type: [{type: mongoose.Schema.Types.ObjectId, ref: "File"}]})
    childs: File[];

}

export const FileSchema = SchemaFactory.createForClass(File);
