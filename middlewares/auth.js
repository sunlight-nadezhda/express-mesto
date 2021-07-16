const jwt = require('jsonwebtoken');

const WrongAuthError = require('../errors/wrong-auth-err');
const NotEnoughRightsError = require('../errors/not-enough-rights-err');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports = (req, res, next) => {
  // достаём авторизационный заголовок
  const { authorization } = req.headers;

  let token;
  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (!authorization) {
    throw new NotEnoughRightsError('Не достаточно прав');
  } else if (!authorization.startsWith('Bearer ')) {
    throw new WrongAuthError('Необходима авторизация');
  } else {
    token = authorization.replace('Bearer ', '');
  }

  let payload;
  try {
    payload = jwt.verify(
      token,
      NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
    );
  } catch (err) {
    throw new WrongAuthError('Необходима авторизация');
  }

  req.user = payload; // записываем пейлоуд в объект запроса

  next();
};
