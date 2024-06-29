const UserModel = require("../models/UserModel")
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const checkPassword = async(req, res) => {
    try {
        const {password, userId} = req.body
        const user = await UserModel.findById(userId)
        const verifyPassword = await bcrypt.compare(password, user.password)
        if (!verifyPassword) {
            return res.status(400).json({
                message: "Please check your password",
                error: true
            })
        }
        const tokenData = {
            id: user.id,
            email: user.email,
        }
        const token = jwt.sign(tokenData, process.env.JWT_SECRET_KEY, {expiresIn: '1d'})
        const cookieOptions = {
            http: true,
            secure: true
        }
        return res.cookie('token', token, cookieOptions).status(200).json({
            message: "Logged in successfully",
            token: token,
            success: true
        })
    } catch (error) {
        return res.status(400).json({
            message: error.message || error,
            error: true
        })
    }
}
module.exports = checkPassword