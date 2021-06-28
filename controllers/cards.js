const Card = require('../models/card');
const NotFoundError = require('../errors/not-found-err');
const NoValidateError = require('../errors/no-validate-err');

// Возвращает все карточки
module.exports.getCards = (req, res, next) => {
  Card.find({})
    .populate(['owner', 'likes'])
    .then((cards) => res.send(cards))
    .catch(next);
};

// Создаёт карточку
module.exports.createCard = (req, res, next) => {
  const userId = req.user._id;
  const { name, link } = req.body;
  Card.create({ name, link, owner: userId })
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new NoValidateError('Проверьте введенные данные');
      }
      throw err;
    })
    .catch(next);
};

// Удаляет карточку по идентификатору
module.exports.deleteCardById = (req, res, next) => {
  const userId = req.user._id;
  const { cardId } = req.params;

  Card.findById(cardId)
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Запрашиваемая карточка не найдена');
      }
      if (!card.owner._id.equals(userId)) {
        const ERROR_CODE = 403;
        return res.status(ERROR_CODE).send({ message: 'Не достаточно прав' });
      }
      return Card.findByIdAndRemove(cardId)
        .populate(['owner', 'likes'])
        .then((deletedCard) => res.send(deletedCard));
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new NoValidateError('cardID карточки не валиден');
      }
      throw err;
    })
    .catch(next);
};

// Поставить лайк карточке
module.exports.likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .populate(['owner', 'likes'])
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Запрашиваемая карточка не найдена');
      }
      return res.send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new NoValidateError('cardID карточки не валиден');
      }
      throw err;
    })
    .catch(next);
};

// Убрать лайк с карточки
module.exports.dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .populate(['owner', 'likes'])
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Запрашиваемая карточка не найдена');
      }
      return res.send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new NoValidateError('cardID карточки не валиден');
      }
      throw err;
    })
    .catch(next);
};
