const UserModel = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const registerUser = async(req,res) => {
    try {
        const {name, email, password, profile_pic} = req.body
        const checkMail = await UserModel.findOne({email: email}) 
        if (checkMail) {
            return res.status(400).json({
                message: 'User Already Exists',
                error: true
            })
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        const payload = {
            name: name,
            email: email,
            password: hashedPassword,
            profile_pic
        }
        const user = new UserModel(payload)
        const userSave = await user.save()
        return res.status(201).json({
            message: 'User Created Successfully',
            data: userSave,
            success: true
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true
        });
    }
}
module.exports = registerUser