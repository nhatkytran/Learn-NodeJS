const vowel = ['u', 'e', 'o', 'a', 'i'];

const distinguishVowel = word =>
  vowel.find(letter => word[0].toLowerCase() === letter) ? 'an' : 'a';

const requiredMessage = field =>
  `A tour must have ${distinguishVowel(field)} ${field}!`;

module.exports = requiredMessage;
