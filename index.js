const express = require('express');
const bodyParser = require('body-parser');
require('./db')
require('./models/user')
const authRoute = require('./routes/authRoute');
const requireToken = require('./MiddleWares/AuthTokenRequired');
const port = 3000;

const app = express();

app.use(bodyParser.json());
app.use(authRoute);

app.get('/',requireToken, (req, res) => {
    res.send('Hello World');
})

app.listen(port, () => {
    console.log('server is running');
})