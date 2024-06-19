#!/bin/bash
CGO_LDFLAGS="-L./lib -lradix_engine_toolkit_uniffi" go build
DYLD_LIBRARY_PATH="./lib" ./main
