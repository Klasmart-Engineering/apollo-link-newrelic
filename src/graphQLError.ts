import type { GraphQLError } from "graphql";
import { Attributes } from "./options";

export const defaultGraphQLErrorAttributesCallback = (
    error: GraphQLError
): Attributes => {
    const { extensions, path, locations } = error;
    const attributes: Attributes = {};

    // GraphQLExtensions is loosely typed as Record<string, unknown>, but `code` is part of the
    // Apollo Server specification, so can explicitly check for it
    // https://www.apollographql.com/docs/apollo-server/data/errors/
    if (extensions !== undefined && typeof extensions.code === "string") {
        attributes.code = extensions.code;
    }

    if (path !== undefined) {
        attributes.path = JSON.stringify(path);
    }

    if (locations !== undefined) {
        attributes.locations = JSON.stringify(locations);
    }

    return attributes;
};
