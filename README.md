# Disclosure Version Archive

[![GitHub stars](https://img.shields.io/github/stars/aamirtechs/disclosure-version-archive?style=social)](https://github.com/aamirtechs/disclosure-version-archive/stargazers) [![GitHub forks](https://img.shields.io/github/forks/aamirtechs/disclosure-version-archive?style=social)](https://github.com/aamirtechs/disclosure-version-archive/network/members) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/aamirtechs/disclosure-version-archive/blob/main/LICENSE) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/aamirtechs/disclosure-version-archive/issues)
Live page: https://aamirtechs.github.io/disclosure-version-archive/

Version control for the words consumers actually saw: consent language and disclosures with effective dates, diffs and retrieval by lead date. A dispute about an older lead needs the older words, not todays page.

## Features
- Version control for consumer-facing disclosure and consent wording, entirely in the browser with no server.
- Each version records form name, version label, effective from and to dates, plain text and a change note.
- Synchronous FNV-1a hash of the text for a tamper-evident manifest you can export and re-check.
- Word level diff between any two versions, with added and removed wording highlighted.
- Lookup by date: which version of a form was in effect on a given date, returned with its hash.
- Manifest validation flags overlapping effective ranges for the same form. Import and export the whole archive as JSON.
- Sample wording is neutral text written for this demo and labelled as sample wording, not real legal text.

## How it works
Add versions with form name, label, effective dates, plain text and a change note, all in the page. You can diff two versions, look up the version in effect on any date, validate the manifest, and export or import the whole archive as JSON. It runs entirely in the browser.

## Privacy
Runs 100% in your browser. Your files never leave this device, nothing is uploaded,
and there is no tracking.

## Runbook: operating this in a real shop
- Who approves wording changes: a named compliance or legal owner approves every wording change before it goes live. The person editing the page is never the only approver.
- Capture a snapshot at deploy time: when new wording ships, add a version here on the same day with its effective from date, the plain text exactly as shown, and a short change note.
- Close the previous version: set its effective to date to the day before the new version starts, so lookup by date never returns two versions.
- Keep the manifest: export the archive JSON after each change and store that export with the release record. Re-importing it should reproduce the same hashes.
- Review monthly: run manifest validation, check for overlapping ranges or gaps, and confirm every live form has a current version with a blank effective to date.

## Development
Core logic lives in `src/logic.js` and is shared by the page and the tests.
Run the tests with `npm test`.

## License
MIT, Copyright 2026 Amir Hussain.
