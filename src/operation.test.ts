import { gql, Operation, parser } from "@apollo/client";
import { DocumentNode, getOperationAST, parse } from "graphql";

describe("defaultOperationAttributesCallback", () => {
    // const createOperation = (document: DocumentNode): Operation => {
    //     return {
    //         query: document,

    //     };
    // };

    it("should extract operationName", () => {
        const query = gql`
            query foo {
                bar {
                    baz
                }
            }
        `;

        const operation = parser(query);
    });

    it("should not throw if the query is invalid", () => {
        // TODO
    });

    it("should not throw if the query has multiple definitions", () => {});
});
