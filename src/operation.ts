import { Operation } from "@apollo/client";
import { OperationDefinitionNode } from "graphql";
import { Attributes } from "./options";

export const defaultOperationAttributesCallback = (
    operation: Operation
): Attributes => {
    console.log(operation);
    const { operationName } = operation;

    return {
        // Operation type seems to lie about `operationName: string`, as if not specified it's set to `undefined`
        operationName: operationName ?? "",
        operationType: (
            operation.query.definitions[0] as OperationDefinitionNode
        ).operation.toString(),
        // TODO query, variables with some kind of default pii exclusion list
    };
};
