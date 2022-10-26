const queryOrBodyParser = (source, fields, obj = {}) => {
  fields.forEach((field) => {
    if (source[field]) {
      obj[field] = source[field];
    }
  });
  return obj;
};

module.exports = { queryOrBodyParser };
