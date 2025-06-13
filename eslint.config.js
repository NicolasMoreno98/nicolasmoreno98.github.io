export default [
  {
    files: ["*.js"],
    languageOptions: {
      sourceType: "script"
    },
    rules: {
      "no-unused-vars": "warn",
      "no-undef": "warn",
      "semi": ["warn", "always"],
      "quotes": ["warn", "double"]
    }
  }
];
