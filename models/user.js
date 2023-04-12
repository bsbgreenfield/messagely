/** User class for message.ly */
const bcrypt = require('bcrypt')
const expressError = require('../expressError')
const ExpressError = require('../expressError')
const db = require('../db')

/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) {
    try{
      const hashedPassword = await bcrypt.hash(password, 12)
      const result = await db.query(
        `
        INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING username, password, first_name, last_name, phone
        `, [username, hashedPassword, first_name, last_name, phone, new Date(), new Date()]
      )
        return result.rows[0]
    }
    catch(err){
      throw new ExpressError('Sign in failed', 401)
    }
   }


  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
      const user = await db.query(
        `SELECT * FROM users WHERE username = $1`, [username]
        )
      const correctPassword = await bcrypt.compare(password, user.rows[0].password)
        if (user && correctPassword){
          return true;
        }
        return false;
    }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) { 
    await db.query(
      `UPDATE users SET last_login_at =$1`, [new Date()]
      )

  }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() { 
    const allUsers = await db.query(
      `
      SELECT username, first_name, last_name, phone FROM users;
      `
    )
    return allUsers.rows
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */


  static async get(username) { 
    const user = await db.query(
      `
      SELECT username, first_name, last_name, phone, join_at, last_login_at
      FROM users WHERE username = $1
      `, [username]
    )
    return user.rows[0]
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const userFromMessages = await db.query(
      `
      SELECT id, body, sent_at, read_at, to_username FROM users
      LEFT JOIN messages
      ON users.username = messages.from_username
      WHERE users.username = $1
      `, [username]
    )


    for (let message of userFromMessages.rows){
      let toUser = await db.query(`
      SELECT username, first_name, last_name, phone
      FROM users WHERE username = $1
      `, [message.to_username])

      message.to_user = toUser.rows[0]
      delete message.to_username
    }
   return userFromMessages.rows
   }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) { 
    const userToMessages = await db.query(
      `
      SELECT body, sent_at, read_at, from_username, id FROM users
      LEFT JOIN messages
      ON users.username = messages.to_username
      WHERE users.username = $1
      `, [username]
    )

    for(let message of userToMessages.rows){
      let fromUser = await db.query(`
      SELECT username, first_name, last_name, phone
      FROM users WHERE username = $1
      `, [message.from_username])

      message.from_user = fromUser.rows[0]
      delete message.from_username
    }
    return userToMessages.rows
  }
}


module.exports = User;