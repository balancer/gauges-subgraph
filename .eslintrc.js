module.exports = {
  extends: "airbnb-base-typescript-prettier",
  parser: "@typescript-eslint/parser",
  parserOptions: {
      "project": "./tsconfig.json",
      "tsconfigRootDir": __dirname,
      "sourceType": "module"
  },
  env: {
    es6: true,
  },
  rules: {
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        "ts": "never"
      }
    ],
    "import/prefer-default-export": "off",
    "prefer-destructuring": "off",
    "prefer-template": "off",
    "eqeqeq": "off",
    "prefer-const": "off",
    "@typescript-eslint/no-shadow": "off",
    "lines-between-class-members": "off"
  }
}