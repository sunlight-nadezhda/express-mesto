const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const catchErrUser = (err) => {
  if (err.name === 'CastError') {
    const ERROR_CODE = 400;
    return {
      code: ERROR_CODE,
      message: 'cardID пользователя не валиден',
    };
  }
  return {
    code: 500,
    message: err.message,
  };
};

// Возвращает всех пользователей
module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send(users))
    .catch((err) => res.status(500).send({ message: err.message }));
};

// Возвращает пользователя по _id
module.exports.getUserById = (req, res) => {
  const { userId } = req.params;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        const ERROR_CODE = 404;
        return res.status(ERROR_CODE).send({ message: 'Запрашиваемый пользователь не найден' });
      }
      return res.send(user);
    })
    .catch((err) => {
      const { code, message } = catchErrUser(err);
      return res.status(code).send({ message });
    });
};

// Создаёт пользователя
module.exports.createUser = (req, res) => {
  const {
    name,
    about,
    avatar,
    email,
    password,
  } = req.body;

  if (password.trim().length < 8 || /\s/.test(password.trim())) {
    const ERROR_CODE = 400;
    return res.status(ERROR_CODE).send({ message: 'Проверьте введенные данные' });
  }

  return bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      about,
      avatar,
      email,
      password: hash,
    }))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const ERROR_CODE = 400;
        return res.status(ERROR_CODE).send({ message: 'Проверьте введенные данные' });
      }
      if (err.name === 'MongoError') {
        const ERROR_CODE = 400;
        return res.status(ERROR_CODE).send({ message: 'Введенный email уже занят' });
      }
      return res.status(500).send({ message: err.message });
    });
};

// Обновляет профиль
module.exports.updateProfile = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((user) => {
      if (!user) {
        const ERROR_CODE = 404;
        return res.status(ERROR_CODE).send({ message: 'Запрашиваемый пользователь не найден' });
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError' || err.name === 'ValidationError') {
        const ERROR_CODE = 400;
        return res.status(ERROR_CODE).send({ message: 'Проверьте введенные данные' });
      }
      return res.status(500).send({ message: err.message });
    });
};

// Обновляет аватар
module.exports.updateAvatar = (req, res) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    {
      new: true,
      runValidators: true,
    },
  )
    .then((user) => {
      if (!user) {
        const ERROR_CODE = 404;
        return res.status(ERROR_CODE).send({ message: 'Запрашиваемый пользователь не найден' });
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const ERROR_CODE = 400;
        return res.status(ERROR_CODE).send({ message: 'Проверьте введенные данные' });
      }
      return res.status(500).send({ message: err.message });
    });
};

// Аутентификация пользователя
module.exports.login = (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error('Неправильные почта или пароль'));
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            // хеши не совпали — отклоняем промис
            return Promise.reject(new Error('Неправильные почта или пароль'));
          }

          // аутентификация успешна
          const token = jwt.sign(
            { _id: user._id },
            'some-secret-key',
            { expiresIn: '7d' },
          );
          return res.send({ token });
        });
    })
    .catch((err) => {
      res
        .status(401)
        .send({ message: err.message });
    });
};
