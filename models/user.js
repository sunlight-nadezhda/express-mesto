const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const WrongAuthError = require('../errors/wrong-auth-err');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'Жак-Ив Кусто',
    minlength: 2,
    maxlength: 30,
  },
  about: {
    type: String,
    default: 'Исследователь',
    minlength: 2,
    maxlength: 30,
  },
  avatar: {
    type: String,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: { // опишем свойство validate
      validator(v) { // validator - функция проверки данных. v - значение свойства email
        return validator.isEmail(v); // если email не валиден, вернётся false
      },
      message: 'Проверьте введенные данные', // когда validator вернёт false, будет использовано это сообщение
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
},
{
  versionKey: false,
});

userSchema.statics.findUserByCredentials = async function f(email, password) {
  const user = await this.findOne({ email })
    .select('+password');

  if (!user) {
    throw new WrongAuthError('Неправильные почта или пароль');
  }

  const matched = await bcrypt.compare(password, user.password);

  if (!matched) {
    // хеши не совпали — отклоняем промис
    throw new WrongAuthError('Неправильные почта или пароль');
  }

  // аутентификация успешна
  return user;
};

module.exports = mongoose.model('user', userSchema);
