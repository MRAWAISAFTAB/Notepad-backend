import User from "../models/Schema.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { verifyMail } from "../EmailVerify/verifyMail.js";
import Session from "../models/sessionModel.js"
import { sendOtpMail } from "../EmailVerify/sendOtpMail.js";



export const registerUser = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        if (!fullName || !email || !password) {
            return res.status(400).json({
                message: "Please fill all the fields"
            });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                message: "User Already exist"
            });
        }
        const hadshedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            fullName,
            email,
            password: hadshedPassword
        })
        const token = jwt.sign({ id: newUser._id }, process.env.SECRECT_KEY, { expiresIn: "10m" })
        verifyMail(token, email);
        newUser.token = token;
        await newUser.save()
        return res.status(201).json({
            message: "User Registered Successfully",
            data: newUser
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

export const Verification = async (req, res) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authorization token is missing or invalid"
            })
        }


        const token = authHeader.split(" ")[1]

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.SECRECT_KEY)
        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(400).json({
                    message: "The registration has expired"
                })
            }
            return res.status(400).json({
                message: "token verification failed"
            })
        }
        const user = await User.findById(decoded.id)
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            })
        }
        user.token = null
        user.isVerified = true
        await user.save()

        return res.status(200).json({
            message: "Email Verified Successfully"
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message
        })
    }
}

export const LoggedinUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({
                message: "please Fill all the fields"
            })
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Unauthoriazed Access"
            })
        }
        const passwordCheck =await bcrypt.compare(password, user.password);
        if(!passwordCheck){ 
            return res.status(401).json({
                message : "Incorrect Password"
            })
        }
        // checking if user is verified
        if(user.isVerified !== true){
            return res.status(403).json({
                message : "Verify your account then login"
            })
        }

        // checking for existing session
        const existingSession = await  Session.findOne({userId : user._id});
        if(existingSession){
            await Session.deleteOne({userId: user._id})
        }

        // create a new session 
        await Session.create({userId:user._id})

        // generate tokens 
        const accessToken = jwt.sign({id : user._id}, process.env.SECRECT_KEY, {expiresIn : "10d"})
        const refreshToken = jwt.sign({id : user._id}, process.env.SECRECT_KEY, {expiresIn : "30d"})

        user.isLoggedIn = true;
        await user.save()

        return res.status(200).json({
            success : true,
            message : `Welcome back ${user.fullName}`,
            accessToken,
            refreshToken,
            data:user
        })

    } catch (error) {
         return res.status(500).json({
            message : error.message,

         })
    }
}

export const LogoutUser = async(req,res) =>{
    try {
        const userId = req.userId
        await Session.deleteMany({userId});
        await User.findByIdAndUpdate(userId, {isLoggedIn : false});
        return res.status(200).json({
            message : "Logged Out Successfully"
        })
    } catch (error) {
        return res.status(500).json({
         message : error.message
        })
    }
}

export const forgotPassword = async(req,res) =>{
       try {
        const {email} = req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({
                message : "User not found"
            })
        }
        const otp = Math.floor(100000 + Math.random()*1200000).toString();
        const expiry = new Date(Date.now()+10*60*1000)

        user.otp = otp;
        user.otpExpiry = expiry;
        await user.save();
        await sendOtpMail(email ,otp);
        return res.status(200).json({
            message : "OTP Sent Sucessfully"
        })

       } catch (error) {
        return res.status(500).json({ message: error.message })
       }
}


export const VerifyOTP = async(req,res) => {
    const {otp} = req.body 
    const email = req.params.email

    if(!otp){
        return res.status(400).json({
          message : "OTP is Required"  
        })
    }
    try {
        const user = await User.findOne({email})
        if(!user){
            return res.status(404).json({
                message : "User not found"
            })
        }
        if(!user.otp || !user.otpExpiry){
            return res.status(400).json({
                message : "OTP not generated or already verified" 
            })
        }
        if(user.otpExpiry < new Date()){
            return res.status(400).json({
                message : "OTP expired request a new one"
            })
        }
        if(otp !== user.otp){
            return res.status(400).json({
                message : "invalid OTP"
            })
        }

        user.otp = null 
        user.otpExpiry = null
        await user.save()

        return res.status(200).json({
            message : "OTP verified Succesfully"
        })
    } catch (error) {
        return res.status(500).json({
            message : "Internal server error"
        })
    }
}
export const changePassword = async(req ,res)=>{
    const{newPassword ,confirmPassword} = req.body;
    const email = req.params.email
    if(!newPassword || !confirmPassword){
       return res.status(400).json({
        message : "All fields are required"
       })
    }

    if(newPassword !== confirmPassword) {
        return res.status(400).json({
            sucess : false,
            message : "Password doesnt match"
        })
    }
    try {
        const user = await User.findOne({email})
        if(!user){
            return res.status(404).json({
                message : "User not found"
            })
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)
        user.password = hashedPassword
        await user.save()

        return res.status(200).json({
            message : "Password changed sucessfully"
        })
    } catch (error) {
        return res.status(500).json({
           message : "Internal server error"
        })
    }
}