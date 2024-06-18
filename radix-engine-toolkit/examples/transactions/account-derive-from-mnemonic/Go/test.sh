#!/bin/bash
DYLD_LIBRARY_PATH="./lib" CGO_LDFLAGS="-L./lib -lradix_engine_toolkit_uniffi" go test *.go -v

