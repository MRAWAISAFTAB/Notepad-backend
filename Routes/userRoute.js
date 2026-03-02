import express from "express"
import {changePassword, forgotPassword, LoggedinUser, LogoutUser, registerUser, Verification, VerifyOTP} from "../Controllers/AuthController.js"
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import { userSchema, validateUser } from "../Validators/userValidate.js";

const router = express.Router();

// router.post("/Signup" , registerUser)
router.post("/signup",validateUser(userSchema), registerUser)
router.post("/verify", Verification)
router.post("/login", LoggedinUser)
router.post("/logout", isAuthenticated, LogoutUser)
router.post("/forgot-password", forgotPassword)
router.post("/verify-otp/:email", VerifyOTP)
router.post("/change-password/:email", changePassword)



// notepad crud
import { getNotes, createNote, updateNote, deleteNote } from "../Controllers/noteController.js"

router.get("/notes", isAuthenticated, getNotes)
router.post("/notes", isAuthenticated, createNote)
router.put("/notes/:id", isAuthenticated, updateNote)
router.delete("/notes/:id", isAuthenticated, deleteNote)




export default router;