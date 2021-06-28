const jwt = require('jsonwebtoken');

const WrongAuthError = require('../errors/wrong-auth-err');

module.exports = (req, res, next) => {
  // достаём авторизационный заголовок
  const { authorization } = req.headers;

  let token;
  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (!authorization) {
    return res
      .status(403)
      .send({ message: 'Не достаточно прав' });
  } else if (!authorization.startsWith('Bearer ')) {
    throw new WrongAuthError('Необходима авторизация');
  } else {
    token = authorization.replace('Bearer ', '');
  }

  let payload;

  try {
    payload = jwt.verify(token, 'some-secret-key');
  } catch (err) {
    return res
      .status(401)
      .send({ message: 'Необходима авторизация' });
  }

  req.user = payload; // записываем пейлоуд в объект запроса
  // req.user = { _id: '60d8cab5277c3c37e873f018' };
  // req.user = { _id: '123' };

  next();
  return undefined;
};
