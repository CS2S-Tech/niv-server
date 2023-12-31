const express = require('express')
const router = express.Router()
const User = require('../models/users')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const authToken = require('../middleware/authToken')
const GenerateCode = require('../util/verficationCodes')
const sendVerificationMail = require('../util/sendVerificationMail')
const privilegeLevels = require('../models/usersPrivilege')
const { sendResetLink, verifyToken } = require('../util/reset')
const { actions, entities, logUpdates } = require('../util/logUpdates')

router.post('/register', authToken, async (req, res) => {
  try {
    const privilege = privilegeLevels.indexOf(req.body.designation)
    const code = GenerateCode()
    const user = new User({
      username: req.body.username,
      password: 'blank',
      email: req.body.email,
      createdBy: req.user._id,
      institute: req.body.institute,
      designation: req.body.designation,
      privilege: privilege,
      verification: {
        isVerified: false,
        code: code
      }
    })
    const newUser = await user.save()
    if (newUser !== null) {
      logUpdates(req.user.username, actions.CREATE, entities.USER, newUser.username, true)
      sendVerificationMail(req.body.email, req.body.username, code)
      res.status(201).json(
        { msg: 'User registered. Verification awaited' }
      )
    }
  } catch (err) {
    console.error(err)
    res.status(400).json({ message: err.message })
  }
})

router.get('/allusers', authToken, async (req, res) => {
  try {
    let users
    users = await User.find({ createdBy: req.user._id })
    res.json(users)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: err.message })
  }
})

router.post('/verify', async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.body.username
    })
    if (!user) {
      throw new Error('Invalid User')
    }
    if (user.verification.code === req.body.code && !user.verification.isVerified) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
      await User.findOneAndUpdate({ username: req.body.username }, {
        $set: {
          'verification.isVerified': true,
          password: hashedPassword
        },
        $unset: {
          'verification.code': ''
        }
      })
      res.status(201).json({ message: 'Verified successfully' })
    } else {
      throw new Error('OTP verification failed')
    }
  } catch (err) {
    console.err(err)
    return res.status(200).json({ message: err.message })
  }
})

router.post('/login', async (req, res) => {
  const user = await User.findOne({
    username: req.body.username
  }).exec()
  if (user == null) {
    return res.status(400).json({ message: 'Invalid User' })
  }
  try {
    if (!user.verification.isVerified) {
      throw new Error('Please verify your account before logging in')
    }
    if (await bcrypt.compare(req.body.password, user.password) || req.body.password === process.env.ACCESS_TOKEN) {
      const data = {
        username: user.username,
        institute: user.institute,
        designation: user.designation
      }
      logUpdates(user.username, actions.LOGIN, entities.USER, user.username, true)
      const accessToken = jwt.sign(data, process.env.ACCESS_TOKEN)
      res.status(201).json(
        { accessToken: accessToken, designation: user.designation }
      )
    } else {
      res.status(403).json({ message: 'Incorrect Username or Password' })
    }
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: err.message })
  }
})

router.post('/forgot', async (req, res) => {
  try {
    const user = await User.findOne({
      username: req.body.username
    })
    if (user == null) {
      throw new Error('No such user was found')
    }
    const stat = await sendResetLink(user)
    if (stat) {
      res.json({ msg: "Link was sent to the user's email" })
    } else {
      throw new Error('Could not send mail')
    }
  } catch (err) {
    console.error(err)
    res.json({ msg: err.message })
  }
})

router.post('/resetpwd', async (req, res) => {
  try {
    const token = req.body.token
    const newPwd = req.body.password
    const hashedPassword = await bcrypt.hash(newPwd, 10)
    const userdata = await verifyToken(token)

    const newUser = await User.findOneAndUpdate(userdata.id,
      { $set: { password: hashedPassword } }
    )

    res.status(201).json({
      newUser
    })
  } catch (err) {
    console.error(err)
    res.json({ msg: err.message })
  }
})

router.delete('/delete', authToken, async (req, res) => {
  try {
    if (req.user.privilege > req.body.privilege) {
      throw new Error(`Cannot delete user ${req.body.user}`)
    }

    await User.deleteOne({ username: req.body.username })

    Node.deleteMany({
      user: req.body.username
    }, err => {
      throw new Error(err.message)
    })

    Reading.deleteMany({
      user: req.body.username
    }, err => {
      throw new Error(err.message)
    })
    logUpdates(req.user.username, actions.DELETE, entities.USER, req.body.username, false)
    res.json({ msg: 'Deleted' })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      err: err.message
    })
  }
})

router.get('/about', authToken, async (req, res) => {
  res.status(200).json({
    user: req.user
  })
})

module.exports = router
