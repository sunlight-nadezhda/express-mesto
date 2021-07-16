const { celebrate, Joi } = require('celebrate');
const validator = require('validator');

const method = (value) => {
  const result = validator.isURL(value);
  if (result) {
    return value;
  } else {
    throw new Error('URL validation err');
  }
};

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
        keysObject[item] = Joi.string().required().custom(method);
        break;
      case 'email':
        keysObject[item] = Joi.string().required().email();
        break;
      case 'password':
        keysObject[item] = Joi.string().required().min(8);
        break;
      case 'link':
        keysObject[item] = Joi.string().required().custom(method);
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
        keysObject[item] = Joi.string().hex().length(24);
        break;
    }
  });
  return celebrate(elementObject);
};
