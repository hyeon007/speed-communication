# SSL certificate placeholders

`default.prod.conf` expects these files:

- `fullchain.pem`
- `privkey.pem`

For production, copy real certificate files into this directory (or mount them from your host path).

Example with Let's Encrypt:

```bash
sudo cp /etc/letsencrypt/live/<your-domain>/fullchain.pem ./infra/nginx/ssl/fullchain.pem
sudo cp /etc/letsencrypt/live/<your-domain>/privkey.pem ./infra/nginx/ssl/privkey.pem
```

Do not commit real certificate files to Git.
