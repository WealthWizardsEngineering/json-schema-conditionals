const R = require('ramda');

const createdNestedProperties = R.compose(
  R.values,
  R.mapObjIndexed((val, key) => {
    const nestedFields = R.split('.')(key);
    if (nestedFields.length === 1) {
      return {
        [key]: val,
      };
    }
    const newObj = {};
    nestedFields.reduce((acc, value, index) => {
      if (index === nestedFields.length - 1) {
        acc.properties[value] = val;
        return acc.properties[value];
      }
      if (index === 0) {
        acc[value] = {
          type: 'object',
          properties: {},
        };
        return acc[value];
      }
      acc.properties[value] = {
        type: 'object',
        properties: {},
      };
      return acc.properties[value];
    }, newObj);

    return newObj;
  })
);

const createdNestedRequires = (required) => required.map((single) => {
  const nestedFields = R.split('.')(single);
  if (nestedFields.length === 1) {
    return {
      required: [single],
    };
  }
  const obj = { properties: {} };
  nestedFields.reduce((acc, val, index) => {
    if (index === nestedFields.length - 1) return acc;
    if (index === nestedFields.length - 2) {
      acc.properties[val] = {
        type: 'object',
        required: [nestedFields[nestedFields.length - 1]],
      };
      return acc.properties[val];
    }
    acc.properties[val] = {
      type: 'object',
      properties: {},
    };
    return acc.properties[val];
  }, obj);
  return obj;
});

module.exports = {
  createdNestedProperties,
  createdNestedRequires,
};
