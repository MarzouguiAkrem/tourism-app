const { PAGINATION } = require('../config/constants');

const paginate = (req, res, next) => {
  let page = parseInt(req.query.page, 10) || PAGINATION.DEFAULT_PAGE;
  let limit = parseInt(req.query.limit, 10) || PAGINATION.DEFAULT_LIMIT;

  if (page < 1) page = 1;
  if (limit < 1) limit = PAGINATION.DEFAULT_LIMIT;
  if (limit > PAGINATION.MAX_LIMIT) limit = PAGINATION.MAX_LIMIT;

  const skip = (page - 1) * limit;

  req.pagination = { page, limit, skip };
  next();
};

module.exports = { paginate };
