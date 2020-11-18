"use strict";

module.exports = {
    env: {
        es2020: true,
        mocha: true,
        node: true,
    },
    extends: [
        "eslint:recommended", "plugin:mocha/recommended", "plugin:jsdoc/recommended",
    ],
    parserOptions: {
        ecmaVersion: 2020,
    },
    plugins: [
        "mocha", "jsdoc",
    ],
    rules: {
        /* *****************
         * basic
         *******************/
        "indent": ["error", 4],
        "linebreak-style": ["error", "unix"],
        "quotes": ["error", "double"],
        "semi": ["error", "always"],
        "camelcase": ["error", {properties: "always"}],
        /* *****************
         * error prevention
         *******************/
        "wrap-iife": ["error", "inside"],
        "consistent-return": "error",
        "no-template-curly-in-string": "error",
        // TODO: gulp-eslint is running outdated eslint
        // "no-promise-executor-return": "error",
        "eqeqeq": "error",
        "dot-notation": "error",
        "dot-location": ["error", "property"],
        "curly": ["error", "all"],
        // "strict":                        ["error", "global"],
        // "complexity":                    ["error", {max: 10}],
        /* *****************
         * cosmetic
         *******************/
        "space-before-function-paren": ["error", "never"],
        "func-call-spacing": ["error", "never"],
        "function-call-argument-newline": ["error", "consistent"],
        "one-var": ["error", "never"],
        "switch-colon-spacing": ["error", {after: true, before: false}],
        "padded-blocks": ["error", "never"],
        "operator-linebreak": ["error", "after"],
        "quote-props": ["error", "consistent-as-needed"],
        "semi-spacing": ["error", {before: false}],
        "semi-style": ["error", "last"],
        "eol-last": ["error", "always"],
        "space-in-parens": ["error", "never"],
        "space-infix-ops": ["error", {int32Hint: false}],
        "keyword-spacing": ["error", {before: true, after: true}],
        "space-unary-ops": ["error", {words: true, nonwords: false}],
        "spaced-comment": ["error", "always"],
        "key-spacing": ["error", {afterColon: true, beforeColon: false, mode: "strict"}],
        "object-curly-spacing": ["error", "never"],
        "lines-between-class-members": ["error", "always"],
        "comma-dangle": ["error", "always-multiline"],
        "comma-style": ["error", "last"],
        "comma-spacing": ["error", {before: false, after: true}],
        "brace-style": ["error", "1tbs"],
        "array-element-newline": ["error", "consistent"],
        "array-bracket-spacing": ["error", "never"],
        "array-bracket-newline": ["error", "consistent"],
        "no-tabs": "error",
        "no-trailing-spaces": "error",
        "no-unneeded-ternary": "error",
        "no-else-return": "error",
        "no-multi-spaces": "error",
        "new-parens": ["error", "always"],
        "no-whitespace-before-property": "error",
        "no-nested-ternary": "error",
        "nonblock-statement-body-position": ["error", "below", {overrides: "if"}],
        "no-mixed-operators": ["error", {allowSamePrecedence: true}],
        "default-case": "error",
        // TODO: gulp-eslint is running outdated eslint
        // "default-case-last": "error",
        "default-param-last": "error",
        "no-multiple-empty-lines": ["error", {max: 1, maxBOF: 0, maxEOF: 1}],
        "padding-line-between-statements": [
            "error",
            {blankLine: "always", prev: "*", next: "class"},
            {blankLine: "always", prev: "class", next: "*"},
            {blankLine: "always", prev: "if", next: "*"},
        ],
        // "no-underscore-dangle":          "error",
        // "no-magic-numbers":              "error", // some magic numbers are okay (such as the '4' for indent in this file)
        // "no-new":                        "error", // bad for some Mocha tests that expect to throw
        // "one-var-declaration-per-line":  ["error", "never"],
        /* *****************
         * style
         *******************/
        "no-warning-comments": ["warn", {terms: ["TODO", "FIXME", "XXX", "NOTE"]}],
        "sort-vars": "error",
        "yoda": ["error", "never"],
        // "sort-keys": ["warn", "asc", {"natural": true}],
        /* *****************
         * ES6
         *******************/
        "prefer-template": "error",
        "template-curly-spacing": ["error", "never"],
        "sort-imports": ["error"],
        "rest-spread-spacing": ["error", "always"],
        "arrow-parens": ["error", "always"],
        // "require-await": "error", // annoying for API calls that don't contain await
        "prefer-rest-params": "error",
        "prefer-destructuring": "error",
        "prefer-spread": "error",
        "no-useless-rename": "error",
        "no-var": "error",
        "no-duplicate-imports": "error",
        "no-useless-constructor": "error",
        "no-useless-computed-key": "error",
        // "prefer-arrow-callback":         "error", // screws up Mocha
        // "prefer-const":                  "error", // this gets annoying fast
        /* *****************
         * mocha
         *******************/
        "mocha/no-exclusive-tests": ["error", "always"],
        "mocha/no-skipped-tests": ["error", "always"],
        /* *****************
         * jsdoc
         *******************/
        "jsdoc/require-returns-check": "off",
        "jsdoc/require-returns": "off",
        "jsdoc/check-indentation": "off",
        "jsdoc/require-description": "error",
        "jsdoc/valid-types": "error",
        "jsdoc/require-jsdoc": [
            "error", {
                enableFixer: false,
                publicOnly: true,
                checkGetters: true,
                checkSetters: true,
                require: {
                    ClassDeclaration: true,
                    ClassExpression: true,
                    FunctionDeclaration: true,
                    FunctionExpression: true,
                    MethodDefinition: true,
                    ArrowFunctionExpression: true,
                },
            },
        ],
    },
    settings: {
        jsdoc: {
            tagNamePreference: {
                augments: "extends",
            },
        },
    },
    // XXX: only necessary because gulp-eslint is still on eslint 6.0
    globals: {
        globalThis: "writable",
    },
};
