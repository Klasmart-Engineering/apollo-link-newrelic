/**
 * @jest-environment jsdom
 */

import { ApolloLink, execute, gql, Observable } from "@apollo/client";
import { GraphQLError } from "graphql";
import { createServerError } from "../test/apollo";
import { setupNewRelicMock } from "../test/newrelic";
import { NewRelicLink } from "./link";
import { isServerError, isServerParseError } from "./networkError";

describe("NewRelicLink", () => {
    beforeEach(() => {
        setupNewRelicMock();
    });

    // Actual query is unimportant, required to satisfy `execute` signature
    const query = gql`
        query {
            foo {
                bar
            }
        }
    `;

    describe("operation", () => {
        const buildFailingLink = () => {
            const mockLink = new ApolloLink(() => {
                throw new Error("Something failed");
            });

            const newRelicLink = new NewRelicLink();
            return newRelicLink.concat(mockLink);
        };

        describe("attributes", () => {
            describe("query", () => {
                it("should extract X by default", (done) => {
                    expect.assertions(1);

                    const link = buildFailingLink();

                    execute(link, {
                        query: gql`
                            query foo {
                                bar {
                                    baz
                                }
                            }
                        `,
                    }).subscribe({
                        error: () => {
                            expect(
                                window.newrelic?.noticeError
                            ).toHaveBeenCalledWith(
                                expect.anything(),
                                expect.objectContaining({
                                    operationName: "foo",
                                    operationType: "query",
                                })
                            );
                            done();
                        },
                    });
                });
            });

            describe("mutation", () => {
                it("should extract X by default", (done) => {
                    expect.assertions(1);

                    const link = buildFailingLink();

                    execute(link, {
                        query: gql`
                            mutation foo {
                                bar(a: 1) {
                                    baz
                                }
                            }
                        `,
                    }).subscribe({
                        error: () => {
                            expect(
                                window.newrelic?.noticeError
                            ).toHaveBeenCalledWith(
                                expect.anything(),
                                expect.objectContaining({
                                    operationName: "foo",
                                    operationType: "mutation",
                                })
                            );
                            done();
                        },
                    });
                });
            });

            it("should set operationName to '' if undefined", (done) => {
                expect.assertions(1);

                const link = buildFailingLink();

                execute(link, {
                    query: gql`
                        query {
                            foo {
                                bar
                            }
                        }
                    `,
                }).subscribe({
                    error: () => {
                        expect(
                            window.newrelic?.noticeError
                        ).toHaveBeenCalledWith(
                            expect.anything(),
                            expect.objectContaining({
                                operationName: "",
                            })
                        );
                        done();
                    },
                });
            });

            it.todo("should call a custom callback if specified");
        });
    });

    describe("no newrelic", () => {
        it.todo("should warn once in development that newrelic is not enabled");

        it.todo("should not warn in production");
    });

    describe("GraphQLError", () => {
        describe("excludeIf", () => {
            it("should not report the GraphQLError if the callback returns true", (done) => {
                expect.assertions(1);

                const ERROR_MESSAGE = "resolver failed";

                const mockLink = new ApolloLink(() =>
                    Observable.of({
                        errors: [
                            {
                                message: ERROR_MESSAGE,
                            } as GraphQLError,
                        ],
                    })
                );

                const newRelicLink = new NewRelicLink({
                    graphQLError: {
                        excludeIf: (error) => error.message === ERROR_MESSAGE,
                    },
                });

                const link = newRelicLink.concat(mockLink);
                execute(link, { query }).subscribe(() => {
                    expect(window.newrelic?.noticeError).not.toHaveBeenCalled();
                    done();
                });
            });

            it("should report the GraphQLError if the callback returns false", (done) => {
                expect.assertions(1);

                const ERROR_MESSAGE = "resolver failed";

                const mockLink = new ApolloLink(() =>
                    Observable.of({
                        errors: [
                            {
                                message: ERROR_MESSAGE,
                            } as GraphQLError,
                        ],
                    })
                );

                const newRelicLink = new NewRelicLink({
                    graphQLError: {
                        excludeIf: (error) => error.message !== ERROR_MESSAGE,
                    },
                });

                const link = newRelicLink.concat(mockLink);
                execute(link, { query }).subscribe(() => {
                    expect(window.newrelic?.noticeError).toHaveBeenCalledTimes(
                        1
                    );
                    done();
                });
            });

            it("should report the GraphQLError by default", (done) => {
                expect.assertions(1);

                const mockLink = new ApolloLink(() =>
                    Observable.of({
                        errors: [
                            {
                                message: "resolver failed",
                            } as GraphQLError,
                        ],
                    })
                );

                const newRelicLink = new NewRelicLink();

                const link = newRelicLink.concat(mockLink);
                execute(link, { query }).subscribe(() => {
                    expect(window.newrelic?.noticeError).toHaveBeenCalledTimes(
                        1
                    );
                    done();
                });
            });
        });

        describe("attributes", () => {
            it("should extract code, path and locations by default", (done) => {
                expect.assertions(2);

                const error = {
                    message: "resolver failed",
                    path: ["fakeResolver"],
                    locations: [
                        {
                            line: 1,
                            column: 1,
                        },
                    ],
                    extensions: {
                        code: "INTERNAL_SERVER_ERROR",
                    },
                } as unknown as GraphQLError;

                const mockLink = new ApolloLink(() =>
                    Observable.of({
                        errors: [error],
                    })
                );

                const newRelicLink = new NewRelicLink();
                const link = newRelicLink.concat(mockLink);

                execute(link, { query }).subscribe(() => {
                    expect(window.newrelic?.noticeError).toHaveBeenCalledTimes(
                        1
                    );
                    expect(window.newrelic?.noticeError).toHaveBeenCalledWith(
                        error,
                        expect.objectContaining({
                            code: error.extensions.code,
                            path: JSON.stringify(error.path),
                            locations: JSON.stringify(error.locations),
                        })
                    );
                    done();
                });
            });

            it("should call a custom callback if provided", (done) => {
                expect.assertions(2);

                const error = {
                    message: "resolver failed",
                    path: ["fakeResolver"],
                    locations: [
                        {
                            line: 1,
                            column: 1,
                        },
                    ],
                    extensions: {
                        code: "INTERNAL_SERVER_ERROR",
                        myCustomKey: "customValue",
                    },
                } as unknown as GraphQLError;

                const mockLink = new ApolloLink(() =>
                    Observable.of({
                        errors: [error],
                    })
                );

                const newRelicLink = new NewRelicLink({
                    graphQLError: {
                        attributes: (error) => {
                            return {
                                staticProperty: "staticValue",
                                customProperty: error.extensions
                                    .myCustomKey as string,
                            };
                        },
                    },
                });
                const link = newRelicLink.concat(mockLink);

                execute(link, { query }).subscribe(() => {
                    expect(window.newrelic?.noticeError).toHaveBeenCalledTimes(
                        1
                    );
                    expect(window.newrelic?.noticeError).toHaveBeenCalledWith(
                        error,
                        expect.objectContaining({
                            customProperty: "customValue",
                            staticProperty: "staticValue",
                        })
                    );
                    done();
                });
            });
        });
    });

    describe("NetworkError", () => {
        describe("excludeIf", () => {
            it("should not report the NetworkError if the callback returns true", (done) => {
                expect.assertions(1);

                const mockLink = new ApolloLink(() => {
                    throw createServerError();
                });

                const newRelicLink = new NewRelicLink({
                    networkError: {
                        excludeIf: (error) => error.name === "ServerError",
                    },
                });
                const link = newRelicLink.concat(mockLink);

                execute(link, { query }).subscribe({
                    error: () => {
                        expect(
                            window.newrelic?.noticeError
                        ).not.toHaveBeenCalled();
                        done();
                    },
                });
            });

            it("should report the NetworkError if the callback returns false", (done) => {
                expect.assertions(1);

                const mockLink = new ApolloLink(() => {
                    throw createServerError();
                });

                const newRelicLink = new NewRelicLink({
                    networkError: {
                        excludeIf: (error) =>
                            error.message === "This will not match",
                    },
                });
                const link = newRelicLink.concat(mockLink);

                execute(link, { query }).subscribe({
                    error: () => {
                        expect(
                            window.newrelic?.noticeError
                        ).toHaveBeenCalledTimes(1);
                        done();
                    },
                });
            });

            it("should report the NetworkError by default", (done) => {
                expect.assertions(1);

                const mockLink = new ApolloLink(() => {
                    throw createServerError();
                });

                const newRelicLink = new NewRelicLink();
                const link = newRelicLink.concat(mockLink);

                execute(link, { query }).subscribe({
                    error: () => {
                        expect(
                            window.newrelic?.noticeError
                        ).toHaveBeenCalledTimes(1);
                        done();
                    },
                });
            });
        });

        it("should extract statusCode by default", (done) => {
            expect.assertions(2);

            const error = createServerError({ statusCode: 418 });

            const mockLink = new ApolloLink(() => {
                throw error;
            });

            const newRelicLink = new NewRelicLink();
            const link = newRelicLink.concat(mockLink);

            execute(link, { query }).subscribe({
                error: () => {
                    expect(window.newrelic?.noticeError).toHaveBeenCalledTimes(
                        1
                    );
                    expect(window.newrelic?.noticeError).toHaveBeenCalledWith(
                        error,
                        expect.objectContaining({
                            statusCode: 418,
                        })
                    );
                    done();
                },
            });
        });

        it("should call a custom callback if provided", (done) => {
            expect.assertions(2);

            const error = createServerError({ statusCode: 502 });

            const mockLink = new ApolloLink(() => {
                throw error;
            });

            const newRelicLink = new NewRelicLink({
                networkError: {
                    attributes: (error) => {
                        return {
                            staticProperty: "staticValue",
                            isBadGateway:
                                isServerError(error) ||
                                isServerParseError(error)
                                    ? (error.statusCode === 502).toString()
                                    : "false",
                        };
                    },
                },
            });
            const link = newRelicLink.concat(mockLink);

            execute(link, { query }).subscribe({
                error: () => {
                    expect(window.newrelic?.noticeError).toHaveBeenCalledTimes(
                        1
                    );
                    expect(window.newrelic?.noticeError).toHaveBeenCalledWith(
                        error,
                        expect.objectContaining({
                            isBadGateway: "true",
                            staticProperty: "staticValue",
                        })
                    );
                    done();
                },
            });
        });
    });
});
