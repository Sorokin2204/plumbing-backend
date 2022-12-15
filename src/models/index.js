const Sequelize = require('sequelize');
const reset = require('../setup');

const setupRelationship = require('../setupRelationship');
require('dotenv').config();

const config = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  pass: process.env.MYSQL_PASS,
  dbName: process.env.MYSQL_DB,
};

const sequelize = new Sequelize(config.dbName, config.user, config.pass, {
  host: config.host,
  dialect: 'mysql',
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  logging: false,
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

//MODELS
db.page = require('./page.model')(sequelize, Sequelize);
// db.homeTabs = require('./homeTabs.modal')(sequelize, Sequelize);
db.pageContent = require('./pageContent.model')(sequelize, Sequelize);
db.pageContentToPage = require('./pageContentToPage.model')(sequelize, Sequelize);
// db.tabContent = require('./tabContent.model')(sequelize, Sequelize);

setupRelationship(db);

module.exports = db;
