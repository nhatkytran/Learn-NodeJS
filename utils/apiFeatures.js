const AppError = require('./appError');

const APIFeatures = async (model, requestQuery, findOptions = {}) => {
  // findOptions --> In case get all reviews of a certain tour
  // findOptions is not defined --> undefined
  // findOptions gets value undefined --> undefined
  // findOptions --> {}

  const queryObject = {
    ...JSON.parse(
      JSON.stringify(requestQuery).replace(
        /\b(gte?|lte?)\b/g,
        match => `$${match}`
      )
    ),
    ...findOptions,
  };

  const totalDocuments = await model.countDocuments(queryObject);

  return new ClsAPIFeatures(model.find(), queryObject, totalDocuments);
};

class ClsAPIFeatures {
  constructor(query, queryObject, totalDocuments) {
    this.query = query;
    this.queryObject = queryObject;
    this.totalDocuments = totalDocuments;
  }

  _convertCond = cond => cond.split(',').join(' ');

  filter() {
    this.query = this.query.find(this.queryObject);

    return this;
  }

  sort() {
    const sortCond = this.queryObject.sort;

    this.query = sortCond
      ? this.query.sort(this._convertCond(sortCond))
      : this.query.sort('-_id');

    return this;
  }

  project() {
    const projectCond = this.queryObject.fields;

    this.query = projectCond
      ? this.query.select(this._convertCond(projectCond))
      : this.query.select('-__v');

    return this;
  }

  paginate() {
    const page = Number(this.queryObject.page) || 1;
    const limit = Number(this.queryObject.limit) || 100;
    // if "page", "limit" is equal to 0 => convert to 1, 100

    if (page < 0 || limit < 0)
      throw new AppError('"page" and "limit" must be positive!', 400);
    if (!Number.isInteger(page) | !Number.isInteger(limit))
      throw new AppError('"page" and "limit" must be an integer!', 400);

    const pages = Math.ceil(this.totalDocuments / limit);

    if (page > pages && pages) throw new AppError('Page not found!', 404);

    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
