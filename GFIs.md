# Good First Issues

## Add gap detection alongside overlap detection
Scope: extend manifest validation to flag date gaps between consecutive versions of the same form, with tests for adjacent and gapped ranges.
Good for a first contribution: validation stays a pure function in src/logic.js.

## Add a side by side diff layout option
Scope: add a toggle that renders the existing diff segments in two columns, removed on the left and added on the right.
Good for a first contribution: reuse diffWords output, do not change the diff logic.

## Add CSV export of the manifest
Scope: add a download that lists form, version, dates, hash and change note as CSV, reusing the manifest builder.
Good for a first contribution: follow the existing JSON export pattern.
