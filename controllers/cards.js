const Card = require('../models/card');
const NotFoundError = require('../errors/not-found-err');
const NoValidateError = require('../errors/no-validate-err');

// Возвращает все карточки
module.exports.getCards = async (req, res, next) => {
  let cards;
  try {
    cards = await Card.find({})
      .populate(['owner', 'likes']);
  } catch (err) {
    next(err);
  }

  try {
    await res.send(cards);
  } catch (err) {
    next(err);
  }
};

// Создаёт карточку
module.exports.createCard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { name, link } = req.body;
    let card;
    try {
      card = await Card.create({ name, link, owner: userId });
    } catch (err) {
      if (err.name === 'ValidationError') {
        throw new NoValidateError('Проверьте введенные данные');
      }
      throw err;
    }
    try {
      await res.send(card);
    } catch (err) {
      next(err);
    }
  } catch (err) {
    next(err);
  }
};

// Удаляет карточку по идентификатору
module.exports.deleteCardById = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { cardId } = req.params;
    let card;
    try {
      card = await Card.findById(cardId);
    } catch (err) {
      if (err.name === 'CastError') {
        throw new NoValidateError('cardID карточки не валиден');
      }
      throw err;
    }

    if (!card) {
      throw new NotFoundError('Запрашиваемая карточка не найдена');
    }
    if (!card.owner._id.equals(userId)) {
      const ERROR_CODE = 403;
      try {
        res.status(ERROR_CODE).send({ message: 'Не достаточно прав' });
      } catch (err) {
        next(err);
      }
    }

    let deletedCard;
    try {
      deletedCard = await Card.findByIdAndRemove(cardId)
        .populate(['owner', 'likes']);
    } catch (err) {
      next(err);
    }
    try {
      res.send(deletedCard);
    } catch (err) {
      next(err);
    }
  } catch (err) {
    next(err);
  }
};

// Поставить лайк карточке
module.exports.likeCard = async (req, res, next) => {
  try {
    let card;
    try {
      card = await Card.findByIdAndUpdate(
        req.params.cardId,
        { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
        { new: true },
      )
        .populate(['owner', 'likes']);
    } catch (err) {
      if (err.name === 'CastError') {
        throw new NoValidateError('cardID карточки не валиден');
      }
      throw err;
    }

    if (!card) {
      throw new NotFoundError('Запрашиваемая карточка не найдена');
    }

    try {
      res.send(card);
    } catch (err) {
      next(err);
    }
  } catch (err) {
    next(err);
  }
};

// Убрать лайк с карточки
module.exports.dislikeCard = async (req, res, next) => {
  try {
    let card;
    try {
      card = await Card.findByIdAndUpdate(
        req.params.cardId,
        { $pull: { likes: req.user._id } }, // убрать _id из массива
        { new: true },
      )
        .populate(['owner', 'likes']);
    } catch (err) {
      if (err.name === 'CastError') {
        throw new NoValidateError('cardID карточки не валиден');
      }
      throw err;
    }

    if (!card) {
      throw new NotFoundError('Запрашиваемая карточка не найдена');
    }

    try {
      res.send(card);
    } catch (err) {
      next(err);
    }
  } catch (err) {
    next(err);
  }
};
