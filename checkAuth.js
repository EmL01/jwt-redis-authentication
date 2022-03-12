const jwt = require('jsonwebtoken'),
    redis = require('redis'),
    JWT_SECRET = process.env.JWT_SECRET

module.exports = (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) return res.status(401).json({ msg: 'Unauthorized' });

    const token = authorization.replace('Bearer ', '');

    jwt.verify(token, JWT_SECRET, async (err, payload) => {
        try {
            client = redis.createClient();
            client.on('error', (err) => console.log('Redis Client Error', err));
            await client.connect();

            if(await client.get(token)) {
                return res.status(401).json({ msg: 'Token blacklisted' });
            }

            const { user_id } = await jwt.verify(token, JWT_SECRET)
            req.user_id = user_id
            
            next();
        } catch (err) {
            return res.json({ msg: err.message });
        }
    });
};