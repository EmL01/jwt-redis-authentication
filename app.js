require('dotenv').config()
const express = require('express'),
    app = express(),
    PORT = process.env.PORT || 5000,
    jwt = require('jsonwebtoken'),
    redis = require('redis'),
    checkAuth = require('./checkAuth'),
    Fingerprint = require('express-fingerprint'),
    JWT_ISSUER = process.env.JWT_ISSUER,
    JWT_SECRET = process.env.JWT_SECRET

let client;

app.use(Fingerprint({
    parameters: [
        Fingerprint.useragent,
        Fingerprint.acceptHeaders,
        Fingerprint.geoip,
    ]
}))

app.get('/', async (req, res) => {
    return res.send(JSON.stringify(req.fingerprint))
})

app.post('/login', async (req, res) => {
    try {
        const user_id = '1'
        const payload = { user_id }
        const options = {
            issuer: JWT_ISSUER,
            audience: user_id,
            expiresIn: '1y'
        }
        const token = await jwt.sign(payload, JWT_SECRET, options)
        return res.json({ token })
    } catch (err) {
        return res.json({ msg: err.message })
    }
})

app.post('/token/blacklist/:token', async (req, res) => {
    //Should be fetched from User in db
    const { token } = req.params
    await client.set(token, token, { 'EX': 365*24*60*60 })
    return res.json({ msg: `Token ${token} successfully blacklisted` })
})

app.get('/protected', checkAuth, (req, res) => {
    return res.send(`Protected route for user_id ${req.user_id}`)
})

app.listen(PORT, async () => {
    console.log(`Server started on port ${PORT}`)
    client = redis.createClient();

    client.on('error', (err) => console.log('Redis Client Error', err));

    await client.connect();
})