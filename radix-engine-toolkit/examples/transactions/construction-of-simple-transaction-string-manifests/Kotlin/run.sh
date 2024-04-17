#!/bin/bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd $SCRIPT_DIR

CLASS_PATH=$(../../../../scripts/kotlin-class-path.sh)

mvn package -q
java -classpath "$SCRIPT_DIR/target/kotlin-1.0-SNAPSHOT.jar:$CLASS_PATH" MainKt