#!/bin/bash

# This script finds all of the `run.sh` files that exist in the repository and echos their paths.

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
ROOT=$(cd $SCRIPT_DIR/..; pwd)

find $ROOT -name run.sh