import mongoose from "mongoose";

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: Object,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "user"
    },
    mainrole: {
        type: String,
        default: "user",
      },

    subscription: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Courses"

    }],
    book:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Books"
    }],

    purchasedEbooks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ebooks'
    }],
    purchasedNotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Notes'
    }],
    resetPasswordExpire: Date,
}, {
    timestamps: true,
}
);

export const User = mongoose.model("User", schema);