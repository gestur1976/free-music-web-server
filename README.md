# free-music-web-server

FREE MUSIC WEB SERVER

Music webserver. Search a song and in seconds you'll be listening, watching or downloading it. Easy!

Alpine based image with apache2, php8.0-fpm, node.js and youtube-dl.

It starts a web server where you can search a song (or anything) and it downloads it using youtube_dl and seconds later starts autoplaying.

You can get either the audio file (.mp3) or the video (.mp4) both of them downloadable from the media player.

To get it:

docker run -d --name freemusicwebserver -p [local-port]:80 -v[local-htdocs-folder]:/usr/local/apache2/htdocs gestur1976/freemusicwebserver:latest
The -v option isn't mandatory but as media files get downoaded in htdocs folder the container can get big, so it's better to map it to a local folder. Anyways, all media files are deleted every 30 minutes to free space.

For example, to run it at port 7997 and use /var/www/freemusicserver as local storage:

mkdir -p /var/www/freemusicserver
docker run -d --name freemusicwebserver -p 7997:80 -v /var/www/freemusicserver:/usr/local/apache2/htdocs gestur1976/freemusicwebserver:latest
Type in your browser http://localhost:7997/ and enjoy.

To build the container yourself clone the repository and inside the folder run ./build.sh
