#! /usr/bin/env sh
# Experimental E2E suite: every test except those tagged @requires-email
# (they need an SMTP sink and its API to read the reset link).
# Same stack and options as run-e2e.sh; extra arguments go to `playwright test`.

set -e

exec "$(dirname "$0")/run-e2e.sh" --grep-invert @requires-email "$@"
