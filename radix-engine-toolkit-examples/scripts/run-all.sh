#!/bin/bash

# Finds all of the run.sh scripts, runs them, and reports whether they succeeded or failed.

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
ROOT=$(cd $SCRIPT_DIR/..; pwd)
RUN_SCRIPT_PATHS=$($SCRIPT_DIR/find-all-run-scripts.sh)

for RUN_SCRIPT_PATH in $RUN_SCRIPT_PATHS
do
    $RUN_SCRIPT_PATH > /dev/null 2>&1
    echo "$RUN_SCRIPT_PATH: $?"
done