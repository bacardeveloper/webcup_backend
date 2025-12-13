const Sentry = require("@sentry/node");

Sentry.init({
  dsn: "https://f933f980c987e96feb89f5d709953c31@o4509265587077125.ingest.de.sentry.io/4509265589829712",
  tracesSampleRate: 1.0,
});

module.exports = Sentry;