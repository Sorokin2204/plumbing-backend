require('dotenv').config();
const jwt = require('jsonwebtoken');
const { CustomError, TypeError } = require('../models/customError.model');
const db = require('../models');
const Login = db.logins;
async function auth(req, res, next) {
  try {
  } catch (error) {}
  const authHeader = req.headers['request_token'];
  if (!authHeader) {
    throw new CustomError(401, TypeError.PROBLEM_WITH_TOKEN);
  }
  const login = jwt.verify(authHeader, process.env.SECRET_TOKEN, (err, login) => {
    if (err) {
      throw new CustomError(403, TypeError.PROBLEM_WITH_TOKEN);
    }
    return login;
  });
  const loginFind = await Login.findOne({ raw: true, where: { login } });
  if (!loginFind) {
    throw new CustomError(403, TypeError.PROBLEM_WITH_TOKEN);
  }
  next();
}
module.exports = auth;
