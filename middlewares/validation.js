const { celebrate, Joi } = require('celebrate');

const { AVATAR_PATTERN } = process.env;

module.exports = (element, items) => {
  const elementObject = {};
  const keysObject = {};
  elementObject[element] = keysObject;
  items.forEach((item) => {
    switch (item) {
      case 'name':
      case 'about':
        keysObject[item] = Joi.string().min(2).max(30);
        break;
      case 'avatar':
        keysObject[item] = Joi.string().uri().pattern(new RegExp(AVATAR_PATTERN));
        break;
      case 'email':
        keysObject[item] = Joi.string().required().email();
        break;
      case 'password':
        keysObject[item] = Joi.string().required().min(8);
        break;
      case 'link':
        keysObject[item] = Joi.string().uri();
        break;
      case 'owner':
        keysObject[item] = Joi.link().ref('#user');
        break;
      case 'likes':
        keysObject[item] = Joi.array().unique().items(Joi.link().ref('#user'));
        break;
      case 'createdAt':
        keysObject[item] = Joi.date();
        break;
      default:
        keysObject[item] = Joi.string().alphanum().length(24);
        break;
    }
  });
  return celebrate(elementObject);
};
