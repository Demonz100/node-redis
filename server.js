const express = require("express");

const redis = require("redis");
const axios = require("axios");
const util = require("util")
const redisUrl = "redis://localhost:6379/";

const client = redis.createClient(redisUrl);

client.connect();

client.on('connect', function() {
  console.log('Redis Connected!');
});

client.on('error', err => console.log('Redis Client Error', err));

client.set = util.promisify(client.set)

const app = express();
app.use(express.json());

app.get("/posts/:id", async (req, res) => {
  const { id } = req.params;

  const cachePost = await client.get(`post-${id}`)

  if (cachePost) {
    return res.json(JSON.parse(cachePost))
  }

  const response = await axios.get(`https://jsonplaceholder.typicode.com/posts/${id}`)
  client.set(`post-${id}`, JSON.stringify(response.data))

  return res.json(response.data)
});

app.listen(8080, () => {
  console.log("App is listening on port 8080");
});
