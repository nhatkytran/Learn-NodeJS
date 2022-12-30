const APIFeatures = async (model, requestQuery) => {
  try {
    const queryObject = JSON.parse(
      JSON.stringify(requestQuery).replace(
        /\b(gte?|lte?)\b/g,
        match => `$${match}`
      )
    );

    const totalDocuments = await model.countDocuments(queryObject);

    return new ClsAPIFeatures(model.find(), queryObject, totalDocuments);
  } catch (error) {
    console.error('APIFeatures - Something went wrong!');
    console.error(error);
  }
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
    // if "page" or "limit" is equal to 0 => convert to 1, 100

    if (page < 0 || limit < 0)
      throw new Error('"page" and "limit" must not be negative!');
    if (!Number.isInteger(page) | !Number.isInteger(limit))
      throw new Error('"page" and "limit" must be an integer!');

    const pages = Math.ceil(this.totalDocuments / limit);

    if (page > pages && pages) throw new Error('Page not found!');

    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
