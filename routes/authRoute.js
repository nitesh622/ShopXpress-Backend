const express = require('express');
const router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const nodemailer = require("nodemailer");

router.post('/verify', async (req, res) => {
    const {name, email,phoneNo, password} = req.body;
    const user = new User({
        name,
        email,
        phoneNo,
        password        
    });

    try {
        await user.save();
        const token = jwt.sign({_id: user._id}, process.env.jwt_secret)
        return res.send({token: token});
    }
    catch(err) {
        console.log('some error while saving: ', err);
        return res.send({status: 'Failed', error: err.message});
    }
});

router.post('/signup', async (req, res) => {
    const {name, email,phoneNo, password} = req.body;

    if(!name || !email || !phoneNo || !password) {
        return res.status(422).send({status: 'Failed', error: 'Please fill all the fields!'});
    }
    else {
        try {
            const emailExist = await User.findOne({email: email});
            const phoneNoExist = await User.findOne({phoneNo: phoneNo});

            if(emailExist) {
                return res.status(422).send({status: 'Failed', error: 'Email already exist!'});
            }
            else if(phoneNoExist) {
                return res.status(422).send({status: 'Failed', error: 'Phone Number already exist!'});
            }
            else {
                const otp = Math.floor(1000 + Math.random()*9000);

                let transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com",
                    port: 587,
                    secure: false,
                    auth: {
                        user: process.env.nodemailer_ID,
                        pass: process.env.nodemailer_Pass,
                    },
                });
            
                let info = await transporter.sendMail({
                    from: process.env.nodemailer_ID,
                    to: `${email}`,
                    subject: "Sign Up Verification",
                    text: `Your Verification Code for signup in ShopXpress is ${otp}`,
                    html: `<b>Your Verification Code for signup in ShopXpress is ${otp}</b>`,
                });
            
                console.log("Message sent: %s", info.messageId);
            
                console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

                res.send({message: 'otp sent'})
            }
        }
        catch(err) {
            console.log('Some error occured while finding: ', err);
            return res.send({status: 'Failed', error: err.message});
        }
    }
});

router.post('/signin', async (req, res) => {
    const {email, password} = req.body;
    if(!email || !password) {
        return res.status(422).json({error: 'Please add email or password'});
    }

    const user = await User.findOne({email: email});

    if(!user) {
        return res.status(422).send({error: 'Invalid Credentials'});
    }

    try {
        bcrypt.compare(password, user.password, (err, result) => {
            if(result) {
                const token = jwt.sign({_id: user._id}, process.env.jwt_secret);
                res.send({token});
            }
            else {
                return res.status(422).send({error: 'Invalid Password'});
            }
        })
    }
    catch(err) {
        console.log(err);
    }
});

module.exports = router;