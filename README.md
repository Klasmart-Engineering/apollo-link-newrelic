# apollo-link-newrelic

Apollo Link to report GraphQL errors to NewRelic

Inspired by [apollo-link-sentry](https://github.com/DiederikvandenB/apollo-link-sentry)

## Installation

```sh
npm install @kl-engineering/apollo-link-newrelic
```

## Setup

```js
import { NewRelicLink } from "@kl-engineering/apollo-link-newrelic";

const client = new ApolloClient({
    link: ApolloLink.from([
        new NewRelicLink(),
        new HttpLink({ uri: "http://localhost:8000" }),
    ]),
    cache: new InMemoryCache(),
});
```

### Options

```ts
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
```
