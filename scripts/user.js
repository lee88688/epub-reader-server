'use strict';

const mongoose = require('mongoose');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const getUserModel = require('../app/model/user');

const argv = yargs(hideBin(process.argv))
  .command('add', 'add a user with email and password', yargs => {
    yargs
      .option('name', {
        alias: 'n',
        describe: 'user name',
      })
      .option('password', {
        alias: 'p',
        describe: 'user password',

      })
      .option('email', {
        alias: 'e',
        describe: 'user email',
      })
      .demandOption([ 'email', 'password' ], 'email and password must be provided.');
  })
  .command('remove', 'remove a user with email', yargs => {
    yargs
      .option('email', {
        alias: 'e',
        describe: 'user email',
      })
      .demandOption('email', 'email is need.');
  })
  .help()
  .demandCommand()
  .argv;


mongoose.connect(process.env.MONGO_DB, { useNewUrlParser: true, useUnifiedTopology: true });
// mongoose.connect('mongodb://127.0.0.1:27017/test', { useNewUrlParser: true, useUnifiedTopology: true });

const UserModel = getUserModel({ mongoose });

const getArgvField = (field, index) => (Array.isArray(field) ? field[index] : field);

(async () => {
  const promises = argv._.map(async (command, index) => {
    if (command === 'add') {
      const email = getArgvField(argv.email, index);
      const password = getArgvField(argv.password, index);
      const name = getArgvField(argv.name, index);
      const user = new UserModel({ name, email, password });
      await user.save();
    } else if (command === 'remove') {
      const email = getArgvField(argv.email, index);
      await UserModel.deleteOne({ email });
    }
  });
  await Promise.all(promises);
  mongoose.disconnect();
})();
