#!/bin/sh
PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin"

MEDIASERVEROK=$(ps ax | grep -v grep | grep -c mediaserver.js)

if [ "$MEDIASERVEROK" -eq "0" ]; then
	while true; do
		node mediaserver.js
	done
fi
