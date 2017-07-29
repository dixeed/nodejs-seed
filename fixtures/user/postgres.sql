INSERT INTO "User"(
            id, email, password, lastname, firstname, username, "recoveryToken",
            "tokenExpiration", "createdAt", "updatedAt", "roleId")
    VALUES (1, 'test@gmail.com', 'password', 'harrison', 'ford', null, 'mySecretRecoverytoken',
            '2017-06-08T00:00:00.000Z', '2017-06-08T00:00:00.000Z', '2017-06-08T00:00:00.000Z', null);

SELECT setval('"User_id_seq"', COALESCE((SELECT MAX(id)+1 FROM "User"), 1), false);
