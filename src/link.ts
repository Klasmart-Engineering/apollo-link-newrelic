import { ErrorLink } from "@apollo/client/link/error";
import { mergeDefaultOptions, NewRelicLinkOptions } from "./options";
import type NewRelicBrowser from "new-relic-browser";

const buildErrorHandler = (
    opts: NewRelicLinkOptions
): ErrorLink.ErrorHandler => {
    const options = mergeDefaultOptions(opts);

    return ({ forward, operation, graphQLErrors, networkError, response }) => {
        if (window.newrelic === undefined) {
            // TODO warn once
            return;
        }

        const operationAttributes = options.operation?.attributes?.(operation);

        if (graphQLErrors) {
            graphQLErrors.forEach((graphQLError) => {
                if (options.graphQLError?.excludeIf?.(graphQLError)) {
                    return;
                }

                (window.newrelic as typeof NewRelicBrowser).noticeError(
                    graphQLError,
                    {
                        ...operationAttributes,
                        ...options.graphQLError?.attributes?.(graphQLError),
                    }
                );
            });
        }

        if (networkError && !options.networkError?.excludeIf?.(networkError)) {
            // TODO
            window.newrelic.noticeError(networkError, {
                ...operationAttributes,
                ...options.networkError?.attributes?.(networkError),
            });
        }
    };
};

export class NewRelicLink extends ErrorLink {
    constructor(options: NewRelicLinkOptions = {}) {
        super(buildErrorHandler(options));
    }
}
