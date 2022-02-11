### JSON Schema Conditionals

This package allows you to define custom conditionals within a schema and then will translate that into working JSON schema.

# Conditionals

To create conditional validation through json schema, you need to use a series of `if`, `then` statements within the schema, however this can get very messy. Instead of defining these by hand you can instead define a new `conditionals` key and then when fact find validator complies the schema, it will inject all of the necessary `if`, `then` inside of an `allOf`. The `conditionals` be placed at the same depth as Example:

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

You can also have nested conditionals. For the fields string include the path by separating keys with a dot.

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
