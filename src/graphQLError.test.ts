import { GraphQLError } from "graphql";
import { defaultGraphQLErrorAttributesCallback } from "./graphQLError";

describe("defaultGraphQLErrorAttributesCallback", () => {
    it("should extract code, path and location from the GraphQLError", () => {
        const error = {
            message: "Invalid argument value",
            locations: [
                {
                    line: 2,
                    column: 3,
                },
            ],
            path: ["userWithID"],
            extensions: {
                argumentName: "id",
                code: "BAD_USER_INPUT",
            },
        } as unknown as GraphQLError;

        const attributes = defaultGraphQLErrorAttributesCallback(error);

        expect(attributes).toEqual({
            code: error.extensions.code,
            path: '["userWithID"]',
            locations: '[{"line":2,"column":3}]',
        });
    });
});
