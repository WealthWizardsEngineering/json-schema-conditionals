const {
  createdNestedProperties,
  createdNestedRequires,
} = require('./create-nested-objects');

test('takes in an array of paths and converts them into nested objects - createdNestedRequires', () => {
  const expected = [
    {
      required: ['test1'],
    },
    {
      properties: {
        test2: {
          type: 'object',
          required: ['test3'],
        },
      },
    },
    {
      properties: {
        test4: {
          type: 'object',
          properties: {
            test5: {
              type: 'object',
              required: ['test6'],
            },
          },
        },
      },
    },
  ];

  const actual = createdNestedRequires([
    'test1',
    'test2.test3',
    'test4.test5.test6',
  ]);
  expect(actual).toStrictEqual(expected);
});

test('takes in an object of dependsOn and converts them into nested objects - createdNestedProperties', () => {
  const input = {
    test1: {
      const: 'testVal',
    },
    'test2.test3': {
      const: 'testVal2',
    },
    'test4.test5.test6': {
      const: 'testVal3',
    },
  };

  const expected = [
    {
      test1: {
        const: 'testVal',
      },
    },

    {
      test2: {
        type: 'object',
        properties: {
          test3: {
            const: 'testVal2',
          },
        },
      },
    },

    {
      test4: {
        type: 'object',
        properties: {
          test5: {
            type: 'object',
            properties: {
              test6: {
                const: 'testVal3',
              },
            },
          },
        },
      },
    },
  ];

  const actual = createdNestedProperties(input);
  expect(actual).toStrictEqual(expected);
});
