FROM mileschou/swoole:latest

COPY tcpservice.php /var/www/html

EXPOSE 9501

RUN php tcpservice.php