const router = require('express').Router();
const {
  getCards,
  deleteCardById,
  createCard
} = require('../controllers/cards');

router.get('/', getCards);
router.post('/', createCard);
router.delete('/:cardId', deleteCardById);

module.exports = router;
