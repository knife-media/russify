/**
 * Text satanization service
 *
 * @author Anton Lukin
 * @license MIT
 * @version 1.0.0
 */

const Az = require('az');
const express = require('express');
const SparkMD5 = require('spark-md5');
const asyncRedis = require('async-redis');

const satanization = require('./satanization');


// Parse dotenv config
require('dotenv').config();

// Init express
const app = express();

// Init redis
//const client = asyncRedis.createClient();

/*
client.on('error', (err) => {
  console.log('Redis error: ' + err);
});
*/

Az.Morph.init('node_modules/az/dicts', (err) => {
  if (err) {
    console.log('Az error: ' + err);
  }
});

// Use body parser
app.use(express.json({
  limit: '2MB'
}));

// Post data
app.post('/', async (req, res) => {
  let data = [];

  for (let i = 0; i < req.body.length; i++) {
    let hash = 'satanization-' + SparkMD5.hash(req.body[i]);

    // Find section in redis
    let section = '';//await client.get(hash) || '';

    if (!section) {
      let tokens = Az.Tokens(req.body[i]).done();

      tokens.forEach((token, k) => {
        let word = token.toString();

        if (token.type == 'WORD') {
          word = satanization(tokens, k);
        }

        section = section + word;
      });

      // Store section in redis
      //await client.set(hash, section);
    }

    data[i] = section;
  }

  res.status(200).json({
    'success': true,
    'results': data
  });
});

// Show server error
app.use((err, req, res) => {
  res.status(err.status || 500).json({
    'success': false,
    'message': 'Server internal error'
  });

  console.error(err.message);
});

// Last error handler
app.use((req, res) => {
  res.status(404).json({
    'success': false,
    'message': 'Resource not found'
  });
});


// Start express app
app.listen(process.env.PORT || 3000);
