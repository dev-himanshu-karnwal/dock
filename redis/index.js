const express = require('express');
const morgan = require('morgan');
const Redis = require('ioredis');

const app = express();
const redis = new Redis();

app.use(morgan('dev'));

redis.on('connect', () => {
    console.log('Connected to Redis');
    redis.set('name', 'John Doe');
}); 

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

app.get('/', async (req, res) => {
    const cache = await redis.get('posts');
    if (cache) {
        console.log('Cache hit');
        return res.send(JSON.parse(cache));
    }

    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const data = await response.json();

    await redis.set('posts', JSON.stringify(data));
    await redis.expire('posts', 60);
    console.log('Cache miss');

    res.send(data);
});
