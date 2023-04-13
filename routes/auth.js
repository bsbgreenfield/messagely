const userModel = require('../models/user')
const express = require('express')
const router = new express.Router()
const jwt = require('jsonwebtoken')
const { SECRET_KEY } = require('../config')

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
 router.post("/login", async (req, res, next) => {
    try{
        const {username, password,} = req.body
        const user = await userModel.authenticate(username, password)
        if (user){
            let token = jwt.sign({username}, SECRET_KEY)
            await userModel.updateLoginTimestamp(username)
            return res.json({token})
        }
    }
   catch(err){
    next(err)
   }
 })


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
router.post('/register', async (req, res, next) => {
    try{
        const {username, password, first_name, last_name, phone} = req.body
        const newUser = await userModel.register({username, password, first_name, last_name, phone})
        const newUsername = newUser.username
        let token = jwt.sign({newUsername}, SECRET_KEY)
        await userModel.updateLoginTimestamp(username)
        return res.json({token})
    }
    catch(err){
        next(err)
    }
})

module.exports = router