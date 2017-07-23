INSERT INTO public."Test"("id", "label", "randomValue", "createdAt", "updatedAt")
    VALUES (1, 'Label1', 8, '2017-06-08T00:00:00.000Z', '2017-06-08T00:00:00.000Z');

SELECT setval('"Test_id_seq"', COALESCE((SELECT MAX(id)+1 FROM "Test"), 1), false);
