const messageModel = require('../models/message')
const express = require('express')
const router = new express.Router()
const { ensureLoggedIn, ensureCorrectUser } = require('../middleware/auth')
const ExpressError = require('../expressError')
/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/

router.get('/:id', ensureLoggedIn, async (req, res, next) => {
    try {
        const message = await messageModel.get(req.params.id)
        if (req.user == message.to_user || req.user.username == message.from_user) {
            return res.json({ message })
        }
        else {
            throw new ExpressError('Not authorized to view this message', 401)
        }
    }
    catch (err) {
        next(err)
    }
})

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post('/', ensureLoggedIn, async (req, res, next) => {
    try {
        const from_username = req.user.username
        const { to_username, body } = req.body
        const message = await messageModel.create({ from_username, to_username, body })
        return res.json({ message })
    }
    catch (err) {
        next(err)
    }
})

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post('/:id/read', ensureLoggedIn, async (req,res, next) => {
    try{
        const message = await messageModel.get(req.params.id)
        if (req.user == message.to_user){
            messageModel.markRead(req.params.id)
        }
        else{
            throw new ExpressError('not recipienct of message', 401)
        }
    }
    catch(err){
        next(err)
    }
})

module.exports = router