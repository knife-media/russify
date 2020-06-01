/**
 * Text russification service
 *
 * @author Anton Lukin
 * @license MIT
 * @version 1.0.0
 */

const Az = require('az');
const express = require('express');
const russify = require('./russify');

// Init express
const app = express();

// Use body parser
app.use(express.json());

// Post data
app.post('/', async (req, res, next) => {
  let body = req.body;

  Az.Morph.init('node_modules/az/dicts', (err) => {
    if (err) {
      next(err);
    }

    let data = [];

    body.forEach((section, i) => {
      let html = [];

      // Parse tokens
      let tokens = Az.Tokens(section).done();

      tokens.forEach((token, k) => {
        let word = token.toString();

        if (token.type == 'WORD') {
          word = russify(tokens, k);
        }

        html.push(word);
      });

      data[i] = html.join('');
    });

    res.status(200).json({
      'success': true,
      'response': data
    });
  });
})

// Show server error
app.use((err, req, res, next) => {
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