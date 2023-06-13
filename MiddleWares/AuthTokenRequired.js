const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();

module.exports = (req, res, next) => {
    const { authorization } = req.headers;
    // console.log(authorization);

    if(!authorization) {
        return res.status(401).send({error: 'you must be login, key not given'});
    }

    const token = authorization.replace('Bearer ', '');
    // console.log(token);
    const user = jwt.verify(token, process.env.jwt_secret, async (err, payload)=> {
        if(err) {
            return res.status(401).send({error: 'You must be logged in, token is invalid!'});
        }

        const {_id} = payload;
        try {
            const user = await User.findById(_id);
            req.user = user;
            next();
        }
        catch(err) {
            return res.send({error: err});
        }
    });
}
