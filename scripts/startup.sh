#!/bin/sh
export PATH='/usr/local/apache2/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin'

if [ -f /firstrun ]; then
	echo "Preparing files for the first run..."
#	Install mediaserver app, web files and set permissions to www-data.

#	Mediaserver
	cd /usr/local
	tar xvfz /opt/mediaserver.tar.gz
	cd mediaserver
	./softlinks.sh
	yarn install
	chown -R www-data:www-data ../mediaserver

# 	Web files
	cd /usr/local/apache2
	tar xvfz /opt/htdocs.tar.gz
	chown -R www-data:www-data htdocs	
	
	rm /firstrun
	rm -rf /opt/*
fi
apachectl start
php-fpm8
cd /usr/local/mediaserver
./mediaserver-watchdog.sh >/dev/null 2>/dev/null &

#	Every 30 minutes, all downloaded media gets deleted to save space.
while true; do
	sleep 1800
	cd /usr/local/apache2/htdocs/; rm *.mp3 *.m4a *.mp4 *.webm *.log *.err 2> /dev/null > /dev/null
done

	
