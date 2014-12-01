/*1.
after create table sequence, must create below 2 functions.
*/

DROP FUNCTION IF EXISTS currval;   
DELIMITER $   
CREATE FUNCTION currval (seq_name VARCHAR(50))   
RETURNS INTEGER   
CONTAINS SQL   
BEGIN   
  DECLARE value bigint;   
  SET value = 0;   
  SELECT currentValue INTO value   
  FROM sequence   
  WHERE TableName = seq_name;   
  RETURN value;   
END$   
DELIMITER ; 



DROP FUNCTION IF EXISTS nextval;   
DELIMITER $   
CREATE FUNCTION nextval (seq_name VARCHAR(50))   
RETURNS bigint   
CONTAINS SQL   
BEGIN   
   UPDATE sequence   
   SET currentValue = currentValue + increment   
   WHERE TableName = seq_name;   
   RETURN currval(seq_name);   
END$   
DELIMITER ;  

/*
2.
after create table sequence, the next two records:
*/ 
INSERT INTO sequence VALUES ('Person',1,1000);   
INSERT INTO sequence VALUES ('SystemLog',1,0);
Insert into sequence values('SystemUser',1,0);
Insert into sequence values('DiagramLog',1,0);

/*
3. 
to get the current value, no mater the parameter is in upper or lower case;

SELECT currval('person');

to get the next value:
select nextval('person');   
*/


      
