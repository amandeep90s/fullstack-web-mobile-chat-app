import type { Document } from "mongoose";
import mongoose, { Schema } from "mongoose";

export interface IMessage extends Document {
	chat: mongoose.Types.ObjectId; // Reference to the Chat
	sender: mongoose.Types.ObjectId; // Reference to the User
	content: string;
	createdAt: Date;
	updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
	{
		chat: {
			type: Schema.Types.ObjectId,
			ref: "Chat",
			required: true,
		},
		sender: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		content: {
			type: String,
			required: true,
			trim: true,
		},
	},
	{ timestamps: true },
);

export const Message = mongoose.model<IMessage>("Message", MessageSchema);
