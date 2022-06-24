import { ServerError, ServerParseError } from "@apollo/client";

export const createServerError = (
    { statusCode }: { statusCode: number } = { statusCode: 500 }
): ServerError => {
    const error = new Error("Something went wrong") as ServerError;
    error.name = "ServerError";
    error.response = { ok: false, status: statusCode } as Response;
    error.statusCode = statusCode;
    error.result = {};
    return error;
};

export const createServerParseError = (): ServerParseError => {
    const parseError = new Error("Malformed JSON response") as ServerParseError;
    parseError.name = "ServerParseError";
    parseError.response = { ok: true, statusCode: 200 } as unknown as Response;
    parseError.statusCode = 200;
    parseError.bodyText = "Some invalid JSON";
    return parseError;
};
