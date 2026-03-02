import mongoose from "mongoose"

const noteSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
}, { timestamps: true })

export default mongoose.model("Note", noteSchema)