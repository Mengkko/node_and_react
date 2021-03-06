const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const e = require('express')
const jwt = require('jsonwebtoken')
const saltRounds = 10

/**
 * * 고명우
 * - userSchema 생성
 */
const userSchema = mongoose.Schema({
    name: {
        type: String,
        maxlength: 50,
    },
    email: {
        type: String,
        trim: true,
        unique: 1,
    },
    password: {
        type: String,
        minlength: 5,
    },
    lastname: {
        type: String,
        maxlength: 50,
    },
    role: {
        type: Number,
        default: 0,
    },
    image: String,
    token: {
        type: String,
    },
    tokenExp: {
        type: Number,
    },
})

userSchema.methods.comparePassword = function (plainPassword, cb) {
    bcrypt.compare(plainPassword, this.password, function (err, isMatch) {
        if (err) return cb(err)
        cb(null, isMatch)
    })
}

/**
 * * 고명우
 * - 저장 전에 실행
 */
userSchema.pre('save', function (next) {
    const user = this

    // 비밀번호 암호화
    if (user.isModified('password')) {
        bcrypt.genSalt(saltRounds, function (err, salt) {
            if (err) return next(err)
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) return next(err)
                user.password = hash
                next()
            })
        })
    } else {
        next()
    }
})

/**
 * * 고명우
 * - token 생성
 * @param {func} cb 함수호출시 작성한 콜백함수
 */
userSchema.methods.generateToken = function (cb) {
    var user = this
    // jsonwebtoken
    var token = jwt.sign(user._id.toHexString(), '1234')

    user.token = token

    user.save(function (err, user) {
        if (err) return cb(err)
        cb(null, user)
    })
}

/**
 * * 고명우
 * - 유저가 갖고있는 토큰 검증
 * @param {String} token - 유저가 갖고있던 토큰
 * @param {func} cb  - 콜백 함수
 */
userSchema.statics.findByToken = function (token, cb) {
    var user = this
    // 토큰 복호화 및 검증
    jwt.verify(token, 'secretToken', function (err, decoded) {
        // console.log(err)
        user.findOne({ _id: decoded, token: token }, (err, user) => {
            if (err) return cb(err)
            cb(null, user)
        })
    })
}

/**
 * * 고명우
 * - userSchema를 model로 감쌈
 */
const User = mongoose.model('User', userSchema)

module.exports = { User }
