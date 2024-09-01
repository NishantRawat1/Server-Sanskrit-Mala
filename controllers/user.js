import { User } from "../models/User.js"
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import sendMail,{sendForgotMail} from "../middlewares/sendMail.js";
import TryCatch from '../middlewares/TryCatch.js'

export const register = async (req, res) => {
    try {

        const { email, name, password } = req.body

        let user = await User.findOne({ email });
        if (user) return res.status(400).json({
            message: "User already exists",
        });
        const hashPassword = await bcrypt.hash(password, 10)
        user = {
            email,
            name,
            password: hashPassword,
        }

        const otp = Math.floor(Math.random() * 1000000);

        const activationToken = jwt.sign({
            user,
            otp,
        }, process.env.ACTIVATION_SECRET,
            {
                expiresIn: "5m"
            });

        const data = {
            name, otp
        };

        await sendMail(email, "SanskritMala", data)
        res.status(200).json({
            message: "OTP send successfully",
            activationToken,
            otp
        })
    }
    catch (err) {
        res.status(500).json({
            message: err.message
        })
    }
};

export const verifyUser = async (req, res) => {
    try {
        const { otp, activationToken } = req.body

        const verify = jwt.verify(activationToken, process.env.ACTIVATION_SECRET)

        if (!verify) return res.status(400).json({
            message: "OTP Expired",
        });
        if (verify.otp !== otp) return res.status(400).json({
            message: "Invalid OTP",
        });

        await User.create({
            email: verify.user.email,
            name: verify.user.name,
            password: verify.user.password,
        })

        res.json({
            message: "User created successfully",
        })

    }
    catch (error) {
        res.status(500).json({
            message: error.message
        })

    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user) return res.status(400).json({
            message: "Invalid email or password",
        });

        const mathPassword = await bcrypt.compare(password, user.password);
        if (!mathPassword) return res.status(400).json({
            message: "Invalid  password",
        });

        const token = await jwt.sign({ _id: user._id }, process.env.JWT_SECRET,
            { expiresIn: "15d" 

            })
        res.json({
            message: "Login successful",
            token,
            user
        })


    }
    catch (error) {
        res.status(500).json({
            message: error.message
        })

    }


};

export const myProfile=async(req,res)=>{
    try{
        const user=await User.findById(req.user._id);
        res.json({user});

    }
    catch (error) {
        res.status(500).json({
            message: error.message
        })

    }

}
export const forgotPassword = TryCatch(async (req, res) => {
    const { email } = req.body;
  
    const user = await User.findOne({ email });
  
    if (!user)
      return res.status(404).json({
        message: "No User with this email",
      });
  
    const token = jwt.sign({ email }, process.env.Forgot_Secret);
  
    const data = { email, token };
  
    await sendForgotMail("SanskritMala", data);
  
    user.resetPasswordExpire = Date.now() + 5 * 60 * 1000;
  
    await user.save();
  
    res.json({
      message: "Reset Password Link is send to you mail",
    });
  });
  
  export const resetPassword = TryCatch(async (req, res) => {
    const decodedData = jwt.verify(req.query.token, process.env.Forgot_Secret);
  
    const user = await User.findOne({ email: decodedData.email });
  
    if (!user)
      return res.status(404).json({
        message: "No user with this email",
      });
  
    if (user.resetPasswordExpire === null)
      return res.status(400).json({
        message: "Token Expired",
      });
  
    if (user.resetPasswordExpire < Date.now()) {
      return res.status(400).json({
        message: "Token Expired",
      });
    }
  
    const password = await bcrypt.hash(req.body.password, 10);
  
    user.password = password;
  
    user.resetPasswordExpire = null;
  
    await user.save();
  
    res.json({ message: "Password Reset" });
  });