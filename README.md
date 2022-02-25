[![NPM](https://nodei.co/npm/json-schema-conditionals.png?compact=true)](https://nodei.co/npm/ramda-decimal/)

## JSON Schema Conditionals [![CircleCI](https://circleci.com/gh/WealthWizardsEngineering/json-schema-conditionals.svg?style=svg)](https://circleci.com/gh/WealthWizardsEngineering/ramda-decimal)

This package allows you to define custom conditionals within a schema and then will translate that into valid JSON schema.

## Example

```
const injectConditionals = require('json-schema-conditionals');

const schemaWithConditionals = injectConditionals(schemaValues);
```

## Conditionals

To create conditional validation through json schema, you need to use a series of `if`, `then` statements within an `allOf` key, however this can get very messy. Instead of defining these by hand you can instead define a new `conditionals` key and then when json schema conditionals complies the schema, it will inject all of the necessary `if`, `then` inside of an `allOf`. The `conditionals` key be placed at the top level of the schema.

Example definition:

```
  "conditionals": [
    {
      "fields": ["picked_for_match"],
      "dependsOn": {
        "available_for_match": "yes"
      }
    },
    {
      "fields": ["starting_position"],
      "dependsOn": {
        "picked_for_match": "yes"
      }
    },
    {
      "fields": ["reason_for_not_being_picked"],
      "dependsOn": {
        "picked_for_match": "no"
      }
    }
  ]
```

Example Schema output:

```
    "allOf": [
        {
            "if": {
                "required": [
                    "available_for_match"
                ],
                "properties": {
                    "available_for_match": {
                        "const": "yes"
                    }
                }
            },
            "then": {
                "required": [
                    "picked_for_match"
                ]
            }
        },
        {
            "if": {
                "required": [
                    "available_for_match",
                    "picked_for_match"
                ],
                "properties": {
                    "available_for_match": {
                        "const": "yes"
                    },
                    "picked_for_match": {
                        "const": "yes"
                    }
                }
            },
            "then": {
                "required": [
                    "starting_position"
                ]
            }
        },
        {
            "if": {
                "required": [
                    "available_for_match",
                    "picked_for_match"
                ],
                "properties": {
                    "available_for_match": {
                        "const": "yes"
                    },
                    "picked_for_match": {
                        "const": "no"
                    }
                }
            },
            "then": {
                "required": [
                    "reason_for_not_being_picked"
                ]
            }
        }
    ]
```

You can also have nested conditionals. For the fields string include the path by separating keys with a dot.

Example definition:

```
  "conditionals": [
    {
      "fields": ["fieldToRequire.nestedKey.secondNestedKey"],
      "dependsOn": {
        "conditional": "no"
      }
    }
  ]
```

Example Schema Output:

```
"allOf": [
        {
            "if": {
                "required": [
                    "conditional"
                ],
                "properties": {
                    "conditional": {
                        "const": "no"
                    }
                }
            },
            "then": {
                "properties": {
                    "fieldToRequire": {
                        "type": "object",
                        "properties": {
                            "nestedKey": {
                                "type": "object",
                                "required": [
                                    "secondNestedKey"
                                ]
                            }
                        }
                    }
                }
            }
        }
    ]
```

## Docs

`const schemaWithConditionals = injectConditionals(jsonSchemas)`

Arguments

`jsonSchemas` e.g. [schema1, schema2]

- Array of all the json schemas that you want the conditionals being applied to.
- If you have multiple schemas at once then inject conditionals will only be able to reference and create conditionals for keys within the same schema.

Return Value

`schemaWithConditionals` e.g [schema1WithConditionals, schema2WithConditionals]

- The return value is an array of json schema with the additional `allOf` property
- This schema can now be read/used by other schema validation packages such as Ajv

---

Created by Wealth Wizards Software Engineering - http://wealthwizards.com
