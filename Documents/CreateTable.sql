# source d:/github/tanjinfu/Relationship/Documents/CreateTable.sql;
/*==============================================================*/
/* DBMS name:      MySQL 5.0                                    */
/* Created on:     2008-5-12 21:55:10                           */
/*==============================================================*/



drop table if exists Person;

drop table if exists SystemLog;

drop table if exists Account;



/*==============================================================*/
/* Table: Person                                                */
/*==============================================================*/
create table Person
(
   Id             bigint unsigned not null,
   LastName             nvarchar(10),
   FirstName            nvarchar(40),
   Gender                  tinyint,
   FatherId             bigint unsigned,
   MotherId             bigint unsigned,
   OrderInChildrenOfParents smallint,
   BirthDay             char(12),
   BirthTime            char(8),
   DeathDay             char(12),
   DeathTime            char(8),
   Remark               nvarchar(400),
   StandBy1             nvarchar(100),
   StandBy2             nvarchar(100),
   StandBy3             nvarchar(100),
   IsAlive              tinyint,
   CreatedBy           nvarchar(128),
   CreatedTime         datetime,
   LastModifiedBy            nvarchar(128),
   LastModifiedTime          datetime,
   primary key (Id)
   );

/*==============================================================*/
/* Table: SystemLog                                             */
/*==============================================================*/
create table SystemLog
(
   LogId                bigint not null,
   SystemUserId         bigint,
   LoginTime            datetime,
   IpAddress            varchar(15),
   StandBy1             varchar(50),
   StandBy2             varchar(100),
   StandBy3             varchar(50),
   primary key (LogId)
);

/*==============================================================*/
/* Table: SystemUser                                            */
/*==============================================================*/
create table Account
(
   ID                   bigint not null,
   NickName             nvarchar(50),
   Pword                varchar(100),
   Sex                  tinyint,
   Address              nvarchar(400),
   Email                varchar(100),
   IsAdmin              tinyint,
   LastModifyTime       datetime,
   CreateTime           datetime,
   StandBy1             varchar(50),
   StandBy2             varchar(100),
   StandBy3             varchar(200),
   primary key (ID)
);


