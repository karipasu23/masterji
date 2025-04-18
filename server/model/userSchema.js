const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
    },
    phone: {
        type: Number,
        require: true,
    },
    password: {
        type: String,
        require: true,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    role: {
        type: String,
        enum: ['user', 'tailor', 'admin'],
        default: 'user'
    },
    isTailor: {
        type: Boolean,
        default: false
    }
})

userSchema.pre('save', async function(next) {
    const user = this;
    if (!user.isModified('password')) {
        next();
    }
    try{
        const salt = await bcrypt.genSalt(10);
        const hash_password = await bcrypt.hash(user.password , salt);
        user.password = hash_password;
    } catch (err) {
        next(err)
    }
} )

userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password)
}

userSchema.methods.generateAuthToken = async function() {
    try{
        const token = await jwt.sign({userId : this._id.toString() ,
            isAdmin : this.isAdmin,
            email : this.email,
         }, process.env.SECRET_KEY , { expiresIn: '10d' });
        return token;
    }catch (err) {
        console.log(err);
    }
}

const User = mongoose.model('User' , userSchema);
module.exports = User;