#!/bin/sh
PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/snap/bin"
tar cvfz mediaserver.tar.gz mediaserver
tar cvfz htdocs.tar.gz htdocs
docker build -t gestur1976/freemusicwebserver .
