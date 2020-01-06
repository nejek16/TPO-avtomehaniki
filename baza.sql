CREATE DATABASE storage;
USE storage;
/*==============================================================*/
/* DBMS name:      MySQL 5.0                                    */
/* Created on:     04/01/2020 17:53:46                          */
/*==============================================================*/


drop table if exists NAROCIL;

drop table if exists NAROCILO;

drop table if exists PORABIL;

drop table if exists SHRAMBA;

drop table if exists UPORABNIK;

/*==============================================================*/
/* Table: NAROCIL                                               */
/*==============================================================*/
create table NAROCIL
(
   ID_ORDER             int not null,
   ID_USER              int not null
);

/*==============================================================*/
/* Table: NAROCILO                                              */
/*==============================================================*/
create table NAROCILO
(
   ID_ORDER             int not null AUTO_INCREMENT,
   PARTNUMBER           float not null,
   PARTNAME             varchar(30) not null,
   ORDERED              bool not null,
   ARRIVED              bool not null,
   CANCELLED            bool not null,
   primary key (ID_ORDER)
);

/*==============================================================*/
/* Table: PORABIL                                               */
/*==============================================================*/
create table PORABIL
(
   ID_ITEM              int not null,
   ID_USER              int not null,
   DATE                 date not null
);

/*==============================================================*/
/* Table: SHRAMBA                                               */
/*==============================================================*/
create table SHRAMBA
(
   ID_ITEM              int not null AUTO_INCREMENT,
   PARTNUMBER           float not null,
   PARTNAME             varchar(30) not null,
   SUPPLY               int not null,
   primary key (ID_ITEM)
);

/*==============================================================*/
/* Table: UPORABNIK                                             */
/*==============================================================*/
create table UPORABNIK
(
   ID_USER              int not null AUTO_INCREMENT,
   USERNAME             varchar(20) not null,
   PASSWORD             varchar(20) not null,
   FULL_NAME            varchar(30) not null,
   SKLADISCNIK          bool not null,
   primary key (ID_USER)
);

alter table NAROCIL add constraint FK_NAROCIL foreign key (ID_USER)
      references UPORABNIK (ID_USER) on delete restrict on update restrict;

alter table NAROCIL add constraint FK_NAROCILO foreign key (ID_ORDER)
      references NAROCILO (ID_ORDER) on delete restrict on update restrict;

alter table PORABIL add constraint FK_TAKES foreign key (ID_ITEM)
      references SHRAMBA (ID_ITEM) on delete restrict on update restrict;

alter table PORABIL add constraint FK_USES foreign key (ID_USER)
      references UPORABNIK (ID_USER) on delete restrict on update restrict;

