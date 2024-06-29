const UserModel = require('../models/UserModel')
const checkEmail = async(req, res) => {
    try {
        const {email} = req.body
        const checkMail = await UserModel.findOne({email: email}).select("-password")
        if (!checkMail) {
            return res.status(400).json({
                message: 'User Doesn\'t Exist',
                error: true
            })
        }
        return res.status(200).json({
            message: 'User Verified',
            success: true,
            data: checkMail
        })
    } catch (error) {
        return res.status(500).json({
            message: error.message || error,
            error: true
        });
    }
}
module.exports = checkEmail