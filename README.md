# Node.js Seed Project

This is a blank startup project for Node.js using JWT authentication token.

Once the repository cloned, you should remove the _.git_ file created in order not to fork this repository and start your own one.

## How to use it
1. Start by cloning this repo `git clone`
2. Remove the .git file `rm -rf .git`
3. Install the dependencies `npm install`
4. Generate your private key for the token generation `node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"` and then add it to the `config/security/credentials.json` file:
```JSON
{
    "jwt": {
        "key": "your-generated-private-key"
    }
}
```
5. Run the nodemon server with the command `npm start`

## Configure Database

In the `config/database` folder create a file named `credentials.json` and add within it your database specific configuration:
```JSON
{
    "dev": {
        "database": "my_db",
        "user": "my_user",
        "pass": "my_password",
        "dialect": "postgres",
        "host": "localhost",
        "port": 5432
    },
    "prod": {

    }
}
```

## License

This code is available at github project under [MIT licence](http://revolunet.mit-license.org/).