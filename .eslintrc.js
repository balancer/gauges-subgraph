module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    "project": "./tsconfig.json",
    "tsconfigRootDir": __dirname,
    "sourceType": "module"
  },
  plugins: ["@typescript-eslint", "prettier", "mocha-no-only"],
  env: {
    es6: true,
  },
  rules: {
    "import/prefer-default-export": "off",
    "prefer-destructuring": "off",
    "prefer-template": "off",
    "eqeqeq": "off",
    "prefer-const": "off",
    "@typescript-eslint/no-shadow": "off",
    "lines-between-class-members": "off"
  },
};

