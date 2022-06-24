import type NewRelicBrowser from "new-relic-browser";

export default {};

declare global {
    interface Window {
        newrelic?: typeof NewRelicBrowser;
    }
}
