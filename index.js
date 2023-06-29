const express = require('express');
const cors = require('cors');
const app = express();
const db = require('./src/models');
const bodyParser = require('body-parser');
const pageRouter = require('./src/routes/page.routes');

const reset = require('./src/setup');
const { handleError } = require('./src/middleware/customError');
const { default: axios } = require('axios');
const isBetweenTwoDate = require('./src/utils/isBetweenTwoDate');
const getNowDate = require('./src/utils/getNowDate');
const { CustomError, TypeError } = require('./src/models/customError.model');
const fileUpload = require('express-fileupload');
require('dotenv').config();

var corsOptions = {
  origin: '*',
};
app.use(
  fileUpload({
    createParentPath: true,
  }),
);

app.use(cors(corsOptions));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('./public/files'));
app.use(express.json({ limit: '50mb' }));

app.use(express.urlencoded({ extended: true, limit: '50mb' }));

db.sequelize.sync({ alter: true }).then((se) => {
  reset(db);
});

app.use('/api', pageRouter);

app.use(function (req, res, next) {
  throw new CustomError(404, TypeError.PATH_NOT_FOUND);
});
app.use(handleError);

const PORT = process.env.PORT || 80;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
