#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
echo "Serving Westen from: $(pwd)"
echo "Open: http://127.0.0.1:4173"
python -m http.server 4173
