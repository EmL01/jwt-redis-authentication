require('dotenv').config()
const express = require('express'),
    app = express(),
    PORT = process.env.PORT || 5000,
    jwt = require('jsonwebtoken'),
    redis = require('redis'),
    checkAuth = require('./checkAuth'),
    JWT_ISSUER = process.env.JWT_ISSUER,
    JWT_SECRET = process.env.JWT_SECRET

let client;

app.post('/login', async (req, res) => {
    try {
        const user_id = '1'
        const payload = { user_id }
        const accessTokenOptions = {
            issuer: JWT_ISSUER,
            audience: user_id,
            expiresIn: '10m'
        }
        const refreshTokenOptions = {
            issuer: JWT_ISSUER,
            audience: user_id,
            expiresIn: '1y'
        }
        const accessToken = await jwt.sign(payload, JWT_SECRET, accessTokenOptions)
        const refreshToken = await jwt.sign(payload, JWT_SECRET, refreshTokenOptions)
        return res.json({ accessToken, refreshToken })
    } catch (err) {
        return res.json({ msg: err.message })
    }
})

app.post('/token/blacklist/:access_token', async (req, res) => {
    //Should be fetched from User in db
    const { access_token } = req.params
    await client.set(access_token, access_token)
    return res.json({ msg: `Access token ${access_token} successfully blacklisted` })
})

app.post('/token/blacklist_all', async (req, res) => {
    //Should be fetched from User in db
    const token = process.env.REFRESH_TOKEN
    if(await client.get(token)) {
        return res.json({ msg: 'Refresh token already blacklisted' })
    }
    await client.set(token, token)
    return res.json({ msg: `Refresh token ${token} successfully blacklisted` })
})

app.get('/protected', checkAuth, (req, res) => {
    return res.send(`Protected route for user_id ${req.user_id}`)
})

app.listen(PORT, async () => {
    console.log(`Server started on port ${PORT}`)
    client = redis.createClient();

    client.on('error', (err) => console.log('Redis Client Error', err));

    await client.connect();
    await client.set('key', 'value')
})