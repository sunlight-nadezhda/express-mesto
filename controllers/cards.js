const Card = require("../models/card");

// Возвращает все карточки
module.exports.getCards = (req, res) => {
  Card.find({})
    .populate(["owner", "likes"])
    .then((cards) => {
      const data = [];
      cards.forEach((card) => {
        let { name, link, owner, likes, createdAt, _id } = card;
        delete owner["__v"];
        likes = likes.map((item) => {
          delete item["__v"];
          return item;
        });
        data.push({ name, link, owner, likes, createdAt, _id });
      });

      res.send(data);
    })
    .catch((err) => res.status(500).send({ message: err.message }));
};

// Создаёт карточку
module.exports.createCard = (req, res) => {
  const _id = req.user._id;
  const { name, link } = req.body;
  Card.create({ name, link, owner: _id })
    .populate("owner")
    .then((card) => {
      let { name, link, owner, likes, createdAt, _id } = card;
      delete owner["__v"];
      likes = likes.map((item) => {
        delete item["__v"];
        return item;
      });
      return res.send({ name, link, owner, likes, createdAt, _id });
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

// Удаляет карточку по идентификатору
module.exports.deleteCardById = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .populate(["owner", "likes"])
    .then((card) => {
      let { name, link, owner, likes, createdAt, _id } = card;
      delete owner["__v"];
      likes = likes.map((item) => {
        delete item["__v"];
        return item;
      });
      return res.send({ name, link, owner, likes, createdAt, _id });
    })
    .catch((err) => {
      const ERROR_CODE = 404;

      if (err.name === "CastError") {
        return res
          .status(ERROR_CODE)
          .send({ message: "Запрашиваемая карточка не найдена" });
      }

      return res.status(500).send({ message: err.message });
    });
};

// Поставить лайк карточке
module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true }
  )
    .populate(["owner", "likes"])
    .then((card) => {
      let { name, link, owner, likes, createdAt, _id } = card;
      delete owner["__v"];
      likes = likes.map((item) => {
        delete item["__v"];
        return item;
      });
      return res.send({ name, link, owner, likes, createdAt, _id });
    })
    .catch((err) => res.status(500).send({ message: err.message }));
};

// Убрать лайк с карточки
module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true }
  )
    .populate(["owner", "likes"])
    .then((card) => {
      let { name, link, owner, likes, createdAt, _id } = card;
      delete owner["__v"];
      likes = likes.map((item) => {
        delete item["__v"];
        return item;
      });
      return res.send({ name, link, owner, likes, createdAt, _id });
    })
    .catch((err) => res.status(500).send({ message: err.message }));
};
