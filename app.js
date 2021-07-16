require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
// const cors = require('cors');

const {
  createUser,
  login,
  logout,
} = require('./controllers/users');

const auth = require('./middlewares/auth');
const validation = require('./middlewares/validation');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const cors = require('./middlewares/cors');

// const allowedCors = [
//   'https://mesto-front.nomoredomains.rocks',
//   'http://mesto-front.nomoredomains.rocks',
//   'http://localhost:3000',
// ];
// const corsOptions = {
//   origin: (origin, callback) => {
//     if (allowedCors.indexOf(origin) !== -1 || !origin) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   optionsSuccessStatus: 200,
//   credentials: true,
// };

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

app.use(cors);
// app.use(cors(corsOptions));
// app.options('*', cors());

app.post('/signin',
  validation('body', ['email', 'password']),
  // cors,
  login);

app.post('/signup',
  validation('body', ['name', 'about', 'avatar', 'email', 'password']),
  // cors,
  createUser);

app.get('/signout',
  validation('body', ['email', 'password']),
  // cors,
  logout);

// app.options('*', (req, res) => res
//   .status(200)
//   .end());

// app.use(cors);

app.use(cookieParser());
app.use(auth);

app.use('/users', require('./routes/users'));
app.use('/cards', require('./routes/cards'));

app.all('*', (req, res) => res
  .status(404)
  .send({ message: 'Запрашиваемый ресурс не найден' }));

app.use(errorLogger); // подключаем логгер ошибок

app.use(errors()); // обработчик ошибок celebrate

// здесь обрабатываем все ошибки
app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;

  res
    .status(statusCode)
    .send({
      message: statusCode === 500
        ? 'На сервере произошла ошибка'
        : message,
    });

  next();
});

app.listen(3000);
