import Note from "../models/noteModel.js"

export const getNotes = async (req, res) => {
    try {
        const notes = await Note.find({ userId: req.userId })
        res.status(200).json({ notes })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const createNote = async (req, res) => {
    try {
        const { title, description } = req.body
        if (!title) return res.status(400).json({ message: "Title is required" })
        const note = await Note.create({ userId: req.userId, title, description })
        res.status(201).json({ message: "Note created", note })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const updateNote = async (req, res) => {
    try {
        const note = await Note.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            req.body,
            { new: true }
        )
        if (!note) return res.status(404).json({ message: "Note not found" })
        res.status(200).json({ message: "Note updated", note })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}

export const deleteNote = async (req, res) => {
    try {
        const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.userId })
        if (!note) return res.status(404).json({ message: "Note not found" })
        res.status(200).json({ message: "Note deleted" })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
}