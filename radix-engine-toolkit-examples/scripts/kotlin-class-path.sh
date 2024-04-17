#!/bin/bash

# This script echos the path of all of the required kotlin/java dependencies. It finds all of the 
# JAR files in the dependencies directories, concatenates them with `:` as a separator, and then
# echos the final string. This script is used in various of the Kotlin run scripts to have a unified
# source of the class-path.

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
DEPENDENCIES_DIR=$(cd $SCRIPT_DIR/../dependencies; pwd)

CLASS_PATH=""
for JAR_FILE_PATH in $(ls $DEPENDENCIES_DIR/*.jar)
do
    CLASS_PATH="$CLASS_PATH:$(realpath $JAR_FILE_PATH)"
done

echo $CLASS_PATH