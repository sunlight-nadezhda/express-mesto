const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const NoValidateError = require('../errors/no-validate-err');
const IsAlreadyTakenError = require('../errors/is-already-taken-err');

const { NODE_ENV, JWT_SECRET } = process.env;

// Возвращает всех пользователей
module.exports.getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({});
  } catch (err) {
    next(err);
  }

  try {
    res.send(users);
  } catch (err) {
    next(err);
  }
};

// Возвращает пользователя по _id
module.exports.getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;
    let user;
    try {
      user = await User.findById(userId);
    } catch (err) {
      if (err.name === 'CastError') {
        throw new NoValidateError('userID пользователя не валиден');
      }
      throw err;
    }

    if (!user) {
      throw new NotFoundError('Запрашиваемый пользователь не найден');
    }

    try {
      res.send(user);
    } catch (err) {
      next(err);
    }
  } catch (err) {
    next(err);
  }
};

// Создаёт пользователя
module.exports.createUser = async (req, res, next) => {
  try {
    const {
      name,
      about,
      avatar,
      email,
      password,
    } = req.body;

    if (password.trim().length < 8 || /\s/.test(password.trim())) {
      throw new NoValidateError('Проверьте введенные данные');
    }

    let hash;
    try {
      hash = await bcrypt.hash(password, 10);
    } catch (err) {
      next(err);
    }

    let user;
    try {
      user = await User.create({
        name,
        about,
        avatar,
        email,
        password: hash,
      });
    } catch (err) {
      if (err.name === 'ValidationError') {
        throw new NoValidateError('Проверьте введенные данные');
      }
      if (err.name === 'MongoError' && err.code === 11000) {
        throw new IsAlreadyTakenError('Введенный email уже занят');
      }
      throw err;
    }

    try {
      res.send({
        _id: user._id,
        name: user.name,
        about: user.about,
        avatar: user.avatar,
        email: user.email,
      });
    } catch (err) {
      next(err);
    }
  } catch (err) {
    next(err);
  }
  return undefined;
};

// Обновляет профиль
module.exports.updateProfile = async (req, res, next) => {
  try {
    const { name, about } = req.body;
    let user;
    try {
      user = await User.findByIdAndUpdate(
        req.user._id,
        { name, about },
        {
          new: true,
          runValidators: true,
        },
      );
    } catch (err) {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        throw new NoValidateError('Проверьте введенные данные');
      }
      throw err;
    }

    if (!user) {
      throw new NotFoundError('Запрашиваемый пользователь не найден');
    }

    try {
      res.send(user);
    } catch (err) {
      next(err);
    }
  } catch (err) {
    next(err);
  }
};

// Обновляет аватар
module.exports.updateAvatar = async (req, res, next) => {
  try {
    const { avatar } = req.body;
    let user;
    try {
      user = await User.findByIdAndUpdate(
        req.user._id,
        { avatar },
        {
          new: true,
          runValidators: true,
        },
      );
    } catch (err) {
      if (err.name === 'ValidationError') {
        throw new NoValidateError('Проверьте введенные данные');
      }
      throw err;
    }

    if (!user) {
      throw new NotFoundError('Запрашиваемый пользователь не найден');
    }

    try {
      res.send(user);
    } catch (err) {
      next(err);
    }
  } catch (err) {
    next(err);
  }
};

// Аутентификация пользователя
module.exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  let user;
  try {
    user = await User.findUserByCredentials(email, password);

    // аутентификация успешна
    const token = jwt.sign(
      { _id: user._id },
      NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
      { expiresIn: '7d' },
    );

    try {
      res
        .cookie('jwt', token, {
          maxAge: 3600000,
          httpOnly: true,
          sameSite: false,
          secure: true,
        })
        .send({ message: 'Вы успешно авторизованы!' });
    } catch (err) {
      return next(err);
    }
  } catch (err) {
    return next(err);
  }

  return undefined;
};

// Получает информацию об авторизованном пользователе
module.exports.getUserInfo = async (req, res, next) => {
  try {
    const userId = req.user._id;
    let user;
    try {
      user = await User.findById(userId);
    } catch (err) {
      if (err.name === 'CastError') {
        throw new NoValidateError('userID пользователя не валиден');
      }
      throw err;
    }

    if (!user) {
      throw new NotFoundError('Запрашиваемый пользователь не найден');
    }

    try {
      res.send(user);
    } catch (err) {
      next(err);
    }
  } catch (err) {
    next(err);
  }
};

// Разлогинивание пользователя
module.exports.logout = async (req, res, next) => {
  try {
    res
      .clearCookie('jwt', {
        httpOnly: true,
        sameSite: false,
        secure: true,
      })
      // .cookie('jwt', {
      //   domain: 'http://localhost:3000',
      //   expires: new Date(0),
      //   maxAge: 0,
      //   httpOnly: true,
      //   sameSite: 'none',
      //   secure: true,
      // })
      .send({ message: 'Вы успешно разлогинились!' });
  } catch (err) {
    return next(err);
  }

  return undefined;
};
