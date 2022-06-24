import type NewRelicBrowser from "new-relic-browser";

export const setupNewRelicMock = () => {
    window.newrelic = {
        noticeError: jest.fn(),
    } as unknown as typeof NewRelicBrowser;
};
