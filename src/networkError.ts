import { ServerError, ServerParseError } from "@apollo/client";
import { ErrorResponse } from "@apollo/client/link/error";
import { Attributes } from "./options";

export type NetworkError = NonNullable<ErrorResponse["networkError"]>;

export const isServerError = (error: NetworkError): error is ServerError => {
    return "response" in error && "result" in error && "statusCode" in error;
};

export const isServerParseError = (
    error: NetworkError
): error is ServerParseError => {
    return "response" in error && "bodyText" in error && "statusCode" in error;
};

export const defaultNetworkErrorAttributesCallback = (
    error: NetworkError
): Attributes => {
    if (isServerError(error) || isServerParseError(error)) {
        return {
            statusCode: error.statusCode,
        };
    }

    return {};
};
