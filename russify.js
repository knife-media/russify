const Az = require('az');
const forms = require('./forms');

function getAdjective(tag, adjective = null) {
  let form = [];

  form.push(tag.NMbr);

  if (tag.NMbr === 'sing') {
    form.push(tag.GNdr);
  }

  form.push(tag.CAse);

  let key = form.join(':');

  // Find key in forms
  if (forms.hasOwnProperty(key)) {
    adjective = forms[key];
  }

  return adjective;
}

function getMorph(token, pos) {
  let morph = Az.Morph(token.toString());

  if (morph[0] && morph[0].tag.POS === pos) {
    return morph[0];
  }

  return false;
}

function updateWord(tokens, i) {
  // Get token morph
  let morph = getMorph(tokens[i], 'NOUN');

  // Get token
  let token = tokens[i].toString();

  // Check if current word is noun first
  if (!morph || tokens[i].firstUpper) {
    return token;
  }

  // Get adjective
  let adjective = getAdjective(morph.tag, null);

  if (adjective === null) {
    return token;
  }

  // Check prev tokens
  for (let k = i - 1; k >= 0; k--) {
    // Break on word
    if (tokens[k].type === Az.Tokens.WORD) {

      // Check if prev word is adjective
      if (getMorph(tokens[k], 'ADJF')) {
        adjective = null;
      }

      break;
    }

    // Break on new sentence
    if (tokens[k].toString() === '.') {
      break;
    }
  }

  if (adjective) {
    token = `<ins>${adjective} </ins>${token}`;
  }

  return token;
}

module.exports = updateWord;
