const User = require("../models/user");

// Возвращает всех пользователей
module.exports.getUsers = (req, res) => {
  User.find({})
    .then((users) => {
      const data = [];
      users.forEach((user) => {
        const { name, about, avatar, _id } = user;
        data.push({ name, about, avatar, _id });
      });

      return res.send(data);
    })
    .catch((err) => res.status(500).send({ message: err.message }));
};

// Возвращает пользователя по _id
module.exports.getUserById = (req, res) => {
  const userId = req.params.userId;

  User.findById(userId)
    .then((user) => {
      const { name, about, avatar, _id } = user;
      return res.send({ name, about, avatar, _id });
    })
    .catch((err) => {
      const ERROR_CODE = 404;

      if (err.name === "CastError") {
        return res
          .status(ERROR_CODE)
          .send({ message: "Запрашиваемый пользователь не найден" });
      }

      return res.status(500).send({ message: err.message });
    });
};

// Создаёт пользователя
module.exports.createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((user) => {
      const { name, about, avatar, _id } = user;
      return res.send({ name, about, avatar, _id });
    })
    .catch((err) => {
      const ERROR_CODE = 400;

      if (err.name === "ValidationError") {
        return res
          .status(ERROR_CODE)
          .send({ message: "Проверьте введенные данные" });
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
      upsert: true,
    }
  )
    .then((user) => {
      const { name, about, avatar, _id } = user;
      return res.send({ name, about, avatar, _id });
    })
    .catch((err) => {
      const ERROR_CODE = 400;

      if (err.name === "ValidationError") {
        return res
          .status(ERROR_CODE)
          .send({ message: "Проверьте введенные данные" });
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
      upsert: true,
    }
  )
    .then((user) => {
      const { name, about, avatar, _id } = user;
      return res.send({ name, about, avatar, _id });
    })
    .catch((err) => {
      const ERROR_CODE = 400;

      if (err.name === "ValidationError") {
        return res
          .status(ERROR_CODE)
          .send({ message: "Проверьте введенные данные" });
      }

      return res.status(500).send({ message: err.message });
    });
};
