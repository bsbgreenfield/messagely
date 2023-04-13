const userModel = require('../models/user')
const express = require('express')
const router = new express.Router()
const { ensureLoggedIn, ensureCorrectUser } = require('../middleware/auth')

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get('/', ensureLoggedIn, async (req, res, next) => {
    try{
        const users = await userModel.all()
        return res.json({ users })
    }
    catch(err){
        next(err)
       }
})


/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/

router.get('/:username', ensureCorrectUser, async (req, res, next) => {
    try{
        const user = await userModel.get(req.params.username)
        return res.json({ user })
    }
    catch(err){
        next(err)
       }
})

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/

router.get('/:username/to', ensureCorrectUser, async (req, res, next) => {
    try{
        const messages = await userModel.messagesTo(req.params.username)
        return res.json({ messages })
    }
    catch(err){
        next(err)
       }
})


/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/from',ensureCorrectUser, async (req, res, next) => {
    try{
        const messages = await userModel.messagesFrom(req.params.username)
        return res.json({ messages })
    }
   catch(err){
    next(err)
   }
})

module.exports = router