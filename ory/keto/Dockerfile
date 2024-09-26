FROM oryd/keto:v0.11.1

COPY keto.yml /etc/config/keto/keto.yml
COPY init.sh /init.sh

EXPOSE 4466 4467

ENTRYPOINT ["/init.sh"]
