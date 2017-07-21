INSERT INTO public."Tests"("id", "label", "randomValue", "createdAt", "updatedAt")
    VALUES (1, 'Label1', 8, '2017-06-08T00:00:00.000Z', '2017-06-08T00:00:00.000Z');

SELECT setval('"Tests_id_seq"', COALESCE((SELECT MAX(id)+1 FROM "Tests"), 1), false);
