#!/bin/bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd $SCRIPT_DIR

python -m pip install -r $SCRIPT_DIR/requirements.txt > /dev/null 2>&1
python main.py