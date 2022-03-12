require('dotenv').config()
const express = require('express'),
    app = express(),
    PORT = process.env.PORT || 5000,
    jwt = require('jsonwebtoken'),
    JWT_ISSUER = process.env.JWT_ISSUER,
    JWT_SECRET = process.env.JWT_SECRET

app.post('/register', async (req, res) => {
    try {
        const user_id = '1'
        const payload = { user_id }
        const options = {
            issuer: JWT_ISSUER,
            audience: user_id,
            expiresIn: '10m'
        }
        const token = await jwt.sign(payload, JWT_SECRET, options)
        return res.json(token)
    } catch (err) {
        return res.json({ msg: err.message })
    }
})

app.post('/login', async (req, res) => {
    try {
        const { authorization } = req.headers
        const token = authorization.split(' ')[1]
        const payload = await jwt.verify(token, JWT_SECRET)
        return res.json(payload)
    } catch (err) {
        return res.json({ msg: err.message })
    }
})

app.listen(PORT, () => console.log(`Server started on port ${PORT}`))