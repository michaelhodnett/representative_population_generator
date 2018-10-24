FROM tiangolo/uwsgi-nginx-flask:python3.6

COPY requirements.txt ./requirements.txt
RUN pip install -qr ./requirements.txt

COPY ./config/entrypoint_bis.sh /entrypoint_bis.sh

RUN chmod +x /entrypoint_bis.sh

ENTRYPOINT ["/entrypoint_bis.sh"]

CMD ["/usr/bin/supervisord"]

EXPOSE 8080
