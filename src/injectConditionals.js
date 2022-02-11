const R = require('ramda');
const {
  createdNestedProperties,
  createdNestedRequires,
} = require('./create-nested-objects');

const findObject = (object, path) => {
  if (R.has('conditionals', object)) {
    return { object, path };
  }

  for (let i = 0; i < Object.keys(object).length; i + 1) {
    if (typeof object[Object.keys(object)[i]] === 'object') {
      path.push(Object.keys(object)[i]);
      const o = findObject(object[Object.keys(object)[i]], path);
      if (o != null) return o;
      path.pop();
    }
  }

  return null;
};

const getOtherFields = (key, allConditionals) => R.filter(R.compose(R.includes(key), R.propOr([], 'fields')))(allConditionals);

const consolidateEnums = (enumArr) => {
  const key = R.keys(enumArr[0])[0];

  const enums = R.map(R.path([key, 'const']))(enumArr);

  return { [key]: { enum: enums } };
};

const getDependsOnObjects = (allConditionals) => R.compose(
  R.converge(R.mergeRight, [
    R.compose(
      R.when(R.equals([null]), R.always({})),
      R.ifElse(R.compose(R.lt(1), R.length), consolidateEnums, R.head),
      R.unless(R.equals([null]), R.head),
      R.values,
      R.mapObjIndexed((value, key) => {
        const fromOtherFields = getOtherFields(key, allConditionals);
        if (R.isEmpty(fromOtherFields)) return null;
        const values = R.map(getDependsOnObjects(allConditionals))(
          fromOtherFields
        );
        return values;
      })
    ),
    R.map((value) => ({ const: value })),
  ]),
  R.prop('dependsOn')
);

const getDependsOnValues = (allConditionals) => R.compose(
  R.converge(R.concat, [
    R.compose(
      R.when(R.equals(null), R.always([])),
      R.head,
      R.values,
      R.mapObjIndexed((value, key) => {
        const fromOtherFields = getOtherFields(key, allConditionals);
        if (R.isEmpty(fromOtherFields)) return null;
        const values = R.compose(
          R.uniq,
          R.flatten,
          R.map(getDependsOnValues(allConditionals))
        )(fromOtherFields);
        return values;
      })
    ),
    R.keys,
  ]),
  R.prop('dependsOn')
);

const combineRequiredAndProperties = (
  conditionalInQuestion,
  additionalConditionals
) => R.converge(R.compose(R.reduce(R.mergeDeepLeft, {}), R.concat), [
  () => {
    const dependsOnValues = getDependsOnValues(additionalConditionals)(
      conditionalInQuestion
    );
    const data = createdNestedRequires(dependsOnValues);
    const refinedData = R.reduce(R.mergeDeepWith(R.concat), {}, data);
    return [refinedData];
  },
  R.map(
    R.applySpec({
      properties: R.identity,
    })
  ),
])(
  createdNestedProperties(
    getDependsOnObjects(additionalConditionals)(conditionalInQuestion)
  )
);

const injectConditionals = (schema) => {
  const results = schema.map((object) => {
    const foundObjectAndPath = findObject(object, []);
    if (foundObjectAndPath === null) return object;
    const { object: foundObject, path: foundPath } = foundObjectAndPath;
    const newConditionals = foundObject.conditionals.map(
      R.applySpec({
        if: (x) => combineRequiredAndProperties(x, foundObject.conditionals),
        then: (x) => R.reduce(
          R.mergeDeepWith(R.concat),
          {},
          createdNestedRequires(x.fields)
        ),
      })
    );

    return R.assocPath(
      R.append('allOf', foundPath),
      R.flatten(newConditionals),
      object
    );
  });
  return results;
};

module.exports = {
  injectConditionals,
  getDependsOnObjects,
  getDependsOnValues,
};
