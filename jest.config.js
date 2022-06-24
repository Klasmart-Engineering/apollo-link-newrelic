// jest.config.js

module.exports = {
    // lodash-es is ESM, which isn't supported by Jest out of the box
    transformIgnorePatterns: ["<rootDir>/node_modules/(?!lodash-es)"],
    transform: {
        "^.+\\.(t|j)sx?$": ["@swc-node/jest"],
    },
    testTimeout: 1000,
};
