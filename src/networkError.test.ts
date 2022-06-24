import {
    defaultNetworkErrorAttributesCallback,
    isServerError,
} from "./networkError";
import { createServerError, createServerParseError } from "../test/apollo";

describe("isServerError", () => {
    it("should return false for a base Error", () => {
        expect(isServerError(new Error("Not a ServerError"))).toBe(false);
    });

    it("should return false for a ServerParseError", () => {
        expect(isServerError(createServerParseError())).toBe(false);
    });

    it("should return true for a ServerError", () => {
        expect(isServerError(createServerError())).toBe(true);
    });
});

describe("defaultNetworkErrorAttributesCallback", () => {
    it("should extract the statusCode from a ServerParseError", () => {
        const error = createServerParseError();

        const attributes = defaultNetworkErrorAttributesCallback(error);

        expect(attributes).toEqual({ statusCode: error.statusCode });
    });

    it("should extract the statusCode from a ServerError", () => {
        const error = createServerError();

        const attributes = defaultNetworkErrorAttributesCallback(error);

        expect(attributes).toEqual({ statusCode: error.statusCode });
    });

    it("should return an empty object for a base Error", () => {
        const error = new Error();

        const attributes = defaultNetworkErrorAttributesCallback(error);

        expect(attributes).toEqual({});
    });
});
