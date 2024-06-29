const express = require('express')
const registerUser = require('../Controller/registerUser')
const checkEmail = require('../Controller/checkEmail')
const checkPassword = require('../Controller/checkPassword')
const userDetails = require('../Controller/userDetails')
const logout = require('../Controller/logout')
const updateUserDetails = require('../Controller/updateUserDetails')
const searchUser = require('../Controller/SearchUser')
const router = express.Router()

// register api
router.post('/register', registerUser)
// check user email
router.post('/email', checkEmail)
// check user password
router.post('/password', checkPassword)
// login user details
router.get('/user-details', userDetails)
// logout user
router.get('/logout', logout)
// update user details
router.post('/update-user', updateUserDetails)
// search user
router.post('/search-user', searchUser)

module.exports = router