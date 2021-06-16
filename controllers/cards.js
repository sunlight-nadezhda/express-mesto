// const mongoose = require('mongoose');
const Card = require('../models/card');

const catchErrCard = (err) => {
  if (err.name === 'CastError') {
    const ERROR_CODE = 400;
    return {
      code: ERROR_CODE,
      message: 'cardID карточки не валиден',
    };
  }
  return {
    code: 500,
    message: err.message,
  };
};

// Возвращает все карточки
module.exports.getCards = (req, res) => {
  Card.find({})
    .populate(['owner', 'likes'])
    .then((cards) => res.send(cards))
    .catch((err) => res.status(500).send({ message: err.message }));
};

// Создаёт карточку
module.exports.createCard = (req, res) => {
  const { _id } = req.user;
  const { name, link } = req.body;
  Card.create({ name, link, owner: _id })
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const ERROR_CODE = 400;
        return res.status(ERROR_CODE).send({ message: 'Проверьте введенные данные' });
      }
      return res.send({ message: err.message });
    });
};

// Удаляет карточку по идентификатору
module.exports.deleteCardById = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .populate(['owner', 'likes'])
    .then((card) => {
      if (!card) {
        const ERROR_CODE = 404;
        return res.status(ERROR_CODE).send({ message: 'Запрашиваемая карточка не найдена' });
      }
      return res.send(card);
    })
    .catch((err) => {
      const { code, message } = catchErrCard(err);
      return res.status(code).send({ message });
    });
};

// Поставить лайк карточке
module.exports.likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .populate(['owner', 'likes'])
    .then((card) => {
      if (!card) {
        const ERROR_CODE = 404;
        return res.status(ERROR_CODE).send({ message: 'Запрашиваемая карточка не найдена' });
      }
      return res.send(card);
    })
    .catch((err) => {
      const { code, message } = catchErrCard(err);
      return res.status(code).send({ message });
    });
};

// Убрать лайк с карточки
module.exports.dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .populate(['owner', 'likes'])
    .then((card) => {
      if (!card) {
        const ERROR_CODE = 404;
        return res.status(ERROR_CODE).send({ message: 'Запрашиваемая карточка не найдена' });
      }
      return res.send(card);
    })
    .catch((err) => {
      const { code, message } = catchErrCard(err);
      return res.status(code).send({ message });
    });
};
