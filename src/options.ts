import { GraphQLError } from "graphql";
import type NewRelicBrowser from "new-relic-browser";
import { defaultGraphQLErrorAttributesCallback } from "./graphQLError";
import {
    defaultNetworkErrorAttributesCallback,
    NetworkError,
} from "./networkError";
import { merge } from "lodash-es";
import { defaultOperationAttributesCallback } from "./operation";
import { Operation } from "@apollo/client";

export type Attributes = NonNullable<
    Parameters<typeof NewRelicBrowser["noticeError"]>["1"]
>;

export type AttributeCallback<Entity> = (entity: Entity) => Attributes;

export type NetworkErrorCallback = AttributeCallback<NetworkError>;
export type GraphQLErrorCallback = AttributeCallback<GraphQLError>;

export type ExcludeCallback<E extends Error> = (error: E) => boolean;

export interface NewRelicLinkOptions {
    operation?: {
        /**
         * Callback to enrich the NewRelic error report with custom attributes
         * from the Operation
         *
         * The default callback includes `operationName` and `operationType`
         */
        attributes: AttributeCallback<Operation>;
    };
    graphQLError?: {
        /**
         * Callback to determine if the GraphQLError should be reported
         *
         * By default all GraphQLErrors are reported
         */
        excludeIf?: ExcludeCallback<GraphQLError>;
        /**
         * Callback to enrich the NewRelic error report with custom attributes
         * from the GraphQLError
         *
         * The default callback includes `extensions.code`, `path` and `locations`
         */
        attributes?: AttributeCallback<GraphQLError>;
    };
    networkError?: {
        /**
         * Callback to determine if the NetworkError should be reported
         *
         * By default all NetworkErrors are reported
         */
        excludeIf?: ExcludeCallback<NetworkError>;
        /**
         * Callback to enrich the NewRelic error report with custom attributes
         * from the NetworkError
         *
         * The default callback includes `statusCode`
         */
        attributes?: AttributeCallback<NetworkError>;
    };
}

const defaultOptions = Object.freeze({
    operation: {
        attributes: defaultOperationAttributesCallback,
    },
    graphQLError: {
        excludeIf: () => false,
        attributes: defaultGraphQLErrorAttributesCallback,
    },
    networkError: {
        excludeIf: () => false,
        attributes: defaultNetworkErrorAttributesCallback,
    },
});

export const mergeDefaultOptions = (
    options: NewRelicLinkOptions
): Required<NewRelicLinkOptions> => {
    return merge({}, defaultOptions, options);
};
