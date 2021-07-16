require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
// const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const {
  createUser,
  login,
  logout,
} = require('./controllers/users');

const NotFoundError = require('./errors/not-found-err');

const auth = require('./middlewares/auth');
const validation = require('./middlewares/validation');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const cors = require('./middlewares/cors');
const handlingErrors = require('./middlewares/handling-errors');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message:
    'Очень много аккаунтов создано с этого IP, попробуйте снова через час',
});

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

app.use(requestLogger); // подключаем логгер запросов

app.use(limiter);
app.use(helmet());
app.use(cors);

app.post('/signin',
  validation('body', ['email', 'password']),
  login);

app.post('/signup',
  createAccountLimiter,
  validation('body', ['name', 'about', 'avatar', 'email', 'password']),
  createUser);

app.get('/signout',
  validation('body', ['email', 'password']),
  logout);

app.use(cookieParser());
app.use(auth);

app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));

app.all('*', (req, res) => {
  throw new NotFoundError('Запрашиваемый ресурс не найден');
});

app.use(errorLogger); // подключаем логгер ошибок

app.use(errors()); // обработчик ошибок celebrate

// здесь обрабатываем все ошибки
app.use(handlingErrors);

app.listen(3000);
