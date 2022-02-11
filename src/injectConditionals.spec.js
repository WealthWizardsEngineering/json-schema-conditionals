const {
  getDependsOnObjects,
  getDependsOnValues,
  injectConditionals,
} = require('./injectConditionals');

const fakeConditionals = [
  {
    fields: ['field1'],
    dependsOn: {
      dependsOn1: 'yes',
    },
  },
  {
    fields: ['field2'],
    dependsOn: {
      field1: 'yes',
    },
  },
  {
    fields: ['field3'],
    dependsOn: {
      field1: 'no',
    },
  },
  {
    fields: ['multiple1', 'multiple2'],
    dependsOn: {
      field3: 'maybe',
    },
  },
  {
    fields: ['field4'],
    dependsOn: {
      field3: 'yes',
    },
  },
  {
    fields: ['field4'],
    dependsOn: {
      field3: 'no',
    },
  },
  {
    fields: ['field5'],
    dependsOn: {
      field4: 'yes',
    },
  },
];

test('get other dependsOn objects in conditional array - getDependsOnObjects', () => {
  const expected1 = {
    dependsOn1: { const: 'yes' },
    field1: { const: 'yes' },
  };
  const expected2 = {
    dependsOn1: { const: 'yes' },
    field1: { const: 'no' },
  };
  const actual = getDependsOnObjects(fakeConditionals)(fakeConditionals[1]);
  expect(actual).toStrictEqual(expected1);
  const actual2 = getDependsOnObjects(fakeConditionals)(fakeConditionals[2]);
  expect(actual2).toStrictEqual(expected2);
});

test('get other dependsOn values in conditional array - getDependsOnValues', () => {
  const expected = ['dependsOn1', 'field1'];
  const actual = getDependsOnValues(fakeConditionals)(fakeConditionals[1]);
  expect(actual).toEqual(expected);
  const actual2 = getDependsOnValues(fakeConditionals)(fakeConditionals[2]);
  expect(actual2).toEqual(expected);
});

test('create conditionals for the schema and place them in the correct place- injectConditionals', () => {
  const fakeSchemas = [
    {
      otherProperties: 'fakeValues',
      conditionals: fakeConditionals,
    },
  ];
  const expected = [
    {
      otherProperties: 'fakeValues',
      conditionals: fakeConditionals,
      allOf: [
        {
          if: {
            required: ['dependsOn1'],
            properties: {
              dependsOn1: { const: 'yes' },
            },
          },
          then: { required: ['field1'] },
        },
        {
          if: {
            required: ['dependsOn1', 'field1'],
            properties: {
              dependsOn1: { const: 'yes' },
              field1: { const: 'yes' },
            },
          },
          then: { required: ['field2'] },
        },
        {
          if: {
            required: ['dependsOn1', 'field1'],
            properties: {
              dependsOn1: { const: 'yes' },
              field1: { const: 'no' },
            },
          },
          then: { required: ['field3'] },
        },
        {
          if: {
            required: ['dependsOn1', 'field1', 'field3'],
            properties: {
              field3: { const: 'maybe' },
              dependsOn1: { const: 'yes' },
              field1: { const: 'no' },
            },
          },
          then: { required: ['multiple1', 'multiple2'] },
        },
        {
          if: {
            properties: {
              dependsOn1: {
                const: 'yes',
              },
              field1: {
                const: 'no',
              },
              field3: {
                const: 'yes',
              },
            },
            required: ['dependsOn1', 'field1', 'field3'],
          },
          then: {
            required: ['field4'],
          },
        },
        {
          if: {
            properties: {
              dependsOn1: {
                const: 'yes',
              },
              field1: {
                const: 'no',
              },
              field3: {
                const: 'no',
              },
            },
            required: ['dependsOn1', 'field1', 'field3'],
          },
          then: {
            required: ['field4'],
          },
        },
        {
          if: {
            properties: {
              dependsOn1: {
                enum: ['yes', 'yes'],
              },
              field4: {
                const: 'yes',
              },
            },
            required: ['dependsOn1', 'field1', 'field3', 'field4'],
          },
          then: {
            required: ['field5'],
          },
        },
      ],
    },
  ];

  const actual = injectConditionals(fakeSchemas);
  expect(actual).toStrictEqual(expected);
});
