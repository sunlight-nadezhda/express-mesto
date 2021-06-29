const router = require('express').Router();

const validation = require('../middlewares/validation');

const {
  getCards,
  deleteCardById,
  createCard,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

router.get('/', getCards);

router.delete('/:cardId',
  validation('params', ['cardId']),
  deleteCardById);

router.post('/',
  validation('body', ['name', 'link', 'owner', 'likes', 'createdAt']),
  createCard);

router.put('/:cardId/likes',
  validation('params', ['cardId']),
  likeCard);

router.delete('/:cardId/likes',
  validation('params', ['cardId']),
  dislikeCard);

module.exports = router;
