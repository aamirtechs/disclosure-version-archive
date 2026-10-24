# Changelog

## 1.0.0 - 2026-10-23

- Initial release.
- Version control for consumer-facing disclosure and consent wording, entirely in the browser with no server.
- Each version records form name, version label, effective from and to dates, plain text and a change note.
- Synchronous FNV-1a hash of the text for a tamper-evident manifest you can export and re-check.
- Word level diff between any two versions, with added and removed wording highlighted.
- Lookup by date: which version of a form was in effect on a given date, returned with its hash.
- Manifest validation flags overlapping effective ranges for the same form. Import and export the whole archive as JSON.
- Sample wording is neutral text written for this demo and labelled as sample wording, not real legal text.
