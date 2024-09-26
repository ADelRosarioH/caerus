FROM oryd/kratos:v1.2.0

COPY kratos.yml /etc/config/kratos/kratos.yml
COPY identity.schema.json /etc/config/kratos/identity.schema.json

COPY init.sh /init.sh

EXPOSE 4433 4434

ENTRYPOINT ["/init.sh"]
