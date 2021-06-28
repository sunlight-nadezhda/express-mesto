const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const {
  getCards,
  deleteCardById,
  createCard,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

router.get('/', getCards);

router.delete('/:cardId',
  celebrate({
    params: Joi.object().keys({
      cardId: Joi.string().alphanum().length(24),
    }),
  }),
  deleteCardById);

router.post('/',
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().min(2).max(30),
      link: Joi.string().uri(),
      owner: Joi.link().ref('#user'),
      likes: Joi.array().unique().items(Joi.link().ref('#user')),
      createdAt: Joi.date(),
    }),
  }),
  createCard);

router.put('/:cardId/likes',
  celebrate({
    params: Joi.object().keys({
      cardId: Joi.string().alphanum().length(24),
    }),
  }),
  likeCard);

router.delete('/:cardId/likes',
  celebrate({
    params: Joi.object().keys({
      cardId: Joi.string().alphanum().length(24),
    }),
  }),
  dislikeCard);

module.exports = router;
