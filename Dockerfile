FROM httpd:2.4-alpine
RUN apk update
RUN apk add php8 php8-fpm php8-apcu php8-bz2 php8-cgi php8-curl php8-gd php8-intl php8-mbstring \
           php8-opcache php8-phpdbg php8-pspell php8-soap php8-tidy php8-xml php8-xsl
RUN apk add nodejs-current yarn ffmpeg curl python3
COPY scripts/youtube-dl /usr/local/bin/
RUN chmod +x /usr/local/bin/youtube-dl && ln -s /usr/bin/python3 /usr/bin/python
RUN mkdir -p /opt && touch /firstrun && rm -f /usr/local/apache/htdocs/* 2>/dev/null || true
COPY htdocs.tar.gz /opt/
COPY mediaserver.tar.gz /opt/
COPY conf/httpd.conf /usr/local/apache2/conf/
COPY conf/www.conf /etc/php8/php-fpm.d/
COPY scripts/startup.sh /usr/local/bin/
CMD /usr/local/bin/startup.sh
