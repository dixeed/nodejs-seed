# Deploy instructions

This file is used to gather all deploy process information for this project.

## Configuration files to create

* `config/database/credentials.json`. [Example](config/database/credentials.json.example)
* `config/mailer/transporter.json`. [Example](config/mailer/transporter.json.example)
* `config/security/credentials.json`. [Example](config/security/credentials.json.example) :
  * Generate your private key for the token generation `node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"`

## Prod environment

The project should be started with `NODE_ENV=prod`.
