const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const { PORT = 3000 } = process.env;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use((req, res, next) => {
  req.user = {
    _id: '60c9b0acfae00f078472ad99',
  };

  next();
});

app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));

app.all('*', (req, res) => res.status(404).send({ message: 'Запрашиваемый ресурс не найден' }));

app.listen(PORT);
