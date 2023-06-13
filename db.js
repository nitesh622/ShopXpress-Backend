const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.mongo_url).then(
    () => {
        console.log('Database is connected');
    }
).catch((err) => {
    console.log('Unable to connect to database: ' + err);
})