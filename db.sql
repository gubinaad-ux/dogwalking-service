/*==============================================================*/
/* DBMS name:      PostgreSQL 9.x                               */
/*==============================================================*/

drop table if exists PROVIDE cascade;
drop table if exists SERVICE cascade;
drop table if exists FORM cascade;
drop table if exists FEEDBACK cascade;
drop table if exists Dog cascade;
drop table if exists District cascade;
drop table if exists DOGWALKER cascade;
drop table if exists CLIENT cascade;
drop table if exists BOOKING cascade;
drop table if exists ADMIN cascade;

create table ADMIN (
   ADMIN_ID             SERIAL               not null,
   ADMIN_LOGIN          VARCHAR(25)          not null,
   ADMIN_PASSWORD       VARCHAR(30)          not null,
   ADMIN_ACCESS         CHAR(3)              not null,
   constraint PK_ADMIN primary key (ADMIN_ID)
);

create unique index ADMIN_PK on ADMIN (
ADMIN_ID
);

create table CLIENT (
   CLIENT_ID            SERIAL               not null,
   CLIENT_FIO           VARCHAR(50)          not null,
   CLIENT_PASSWORD      VARCHAR(30)          not null,
   CLIENT_RATING        FLOAT8               not null,
   CLIENT_PHONE         CHAR(10)             not null,
   CLIENT_EMAIL         VARCHAR(100)         not null,
   constraint PK_CLIENT primary key (CLIENT_ID)
);

create unique index CLIENT_PK on CLIENT (
CLIENT_ID
);

create index IDX_CLIENT_EMAIL on CLIENT (CLIENT_EMAIL);

create table DOGWALKER (
   D_WALKER_ID          SERIAL               not null,
   D_WALKER_LOGIN       VARCHAR(25)          not null,
   D_WALKER_RATING      FLOAT8               not null,
   D_WALKER_STATUS      CHAR(1)              not null,
   D_WALKER_PASSWORD    VARCHAR(30)          not null,
   constraint PK_DOGWALKER primary key (D_WALKER_ID)
);

create unique index DOGWALKER_PK on DOGWALKER (
D_WALKER_ID
);

create index IDX_DOGWALKER_RATING on DOGWALKER (D_WALKER_RATING);

create table Dog (
   DOG_ID               SERIAL               not null,
   CLIENT_ID            INT4                 not null,
   DOG_NAME             VARCHAR(30)          not null,
   DOG_BREED            VARCHAR(30)          not null,
   AGE                  INT4                 not null,
   AGE_MONTHS           INT4                 generated always as (AGE * 12) stored,
   WEIGHT               DECIMAL(3,2)         not null,
   FEATURES             VARCHAR(256)         null,
   POTO                 VARCHAR(255)         null,
   constraint PK_DOG primary key (DOG_ID)
);

create unique index Dog_PK on Dog (
DOG_ID
);

create index OWNS_FK on Dog (
CLIENT_ID
);

create table District (
   DISTRICT_ID          SERIAL               not null,
   DISTRICT_NAME        VARCHAR(50)          not null,
   DISTRICT_COEF        FLOAT8               not null,
   constraint PK_DISTRICT primary key (DISTRICT_ID)
);

create unique index District_PK on District (
DISTRICT_ID
);

create table SERVICE (
   SERVICE_ID           SERIAL               not null,
   SERV_NAME            VARCHAR(100)         not null,
   SERV_DISCRIB         VARCHAR(256)         null,
   SERV_BASE_COST       DECIMAL(10,2)        not null,
   constraint PK_SERVICE primary key (SERVICE_ID)
);

create unique index SERVICE_PK on SERVICE (
SERVICE_ID
);

create table BOOKING (
   BOOKING_ID           SERIAL               not null,
   DOG_ID               INT4                 not null,
   DISTRICT_ID          INT4                 not null,
   CLIENT_ID            INT4                 not null,
   D_WALKER_ID          INT4                 not null,
   SERVICE_ID           INT4                 not null,
   ADDRESS              VARCHAR(40)          not null,
   BOOK_STATUS          VARCHAR(10)          not null,
   BOOK_LASTING         TIME                 not null,
   FULL_COST            DECIMAL(5,2)         not null,
   DATETIME             TIMESTAMP            not null,
   FINAL_COST           DECIMAL(6,2)         generated always as (FULL_COST * 1.1) stored,
   constraint PK_BOOKING primary key (BOOKING_ID)
);

create unique index BOOKING_PK on BOOKING (
BOOKING_ID
);

create index INDICATED_FK on BOOKING (
DOG_ID
);

create index COMPLETE_FK on BOOKING (
DISTRICT_ID
);

create index MAKE_FK on BOOKING (
CLIENT_ID
);

create index Fullfille_FK on BOOKING (
D_WALKER_ID
);

create index INCLUDE_FK on BOOKING (
SERVICE_ID
);

create index IDX_BOOKING_DATE_STATUS on BOOKING (DATETIME, BOOK_STATUS);

create table FEEDBACK (
   FEEDBACK_ID          SERIAL               not null,
   CLIENT_ID            INT4                 not null,
   BOOKING_ID           INT4                 not null,
   D_WALKER_ID          INT4                 not null,
   ADMIN_ID             INT4                 not null,
   FEEDBACK_DATE        TIMESTAMP            not null,
   FEEDBACK_SCORE       FLOAT8               not null,
   TEXT                 VARCHAR(256)         null,
   constraint PK_FEEDBACK primary key (FEEDBACK_ID)
);

create unique index FEEDBACK_PK on FEEDBACK (
FEEDBACK_ID
);

create index WRITE_FK on FEEDBACK (
CLIENT_ID
);

create index Describe_FK on FEEDBACK (
BOOKING_ID
);

create index Leave_FK on FEEDBACK (
D_WALKER_ID
);

create index Moderate_FK on FEEDBACK (
ADMIN_ID
);

create table FORM (
   FORM_ID              SERIAL               not null,
   D_WALKER_ID          INT4                 not null,
   ADMIN_ID             INT4                 not null,
   FIO_DOGWOLKER        VARCHAR(50)          not null,
   PASPORT_DATA         VARCHAR(30)          not null,
   PHONE_NUM            CHAR(10)             not null,
   FORM_EMAIL           VARCHAR(100)         not null,
   VER_STATUS           CHAR(3)              not null,
   constraint PK_FORM primary key (FORM_ID)
);

create unique index FORM_PK on FORM (
FORM_ID
);

create index FillIn_FK on FORM (
D_WALKER_ID
);

create index Check_FK on FORM (
ADMIN_ID
);

create table PROVIDE (
   D_WALKER_ID          INT4                 not null,
   SERVICE_ID           INT4                 not null,
   constraint PK_PROVIDE primary key (D_WALKER_ID, SERVICE_ID)
);

create unique index PROVIDE_PK on PROVIDE (
D_WALKER_ID,
SERVICE_ID
);

create index PROVIDE2_FK on PROVIDE (
SERVICE_ID
);

create index PROVIDE_FK on PROVIDE (
D_WALKER_ID
);

alter table BOOKING
   add constraint FK_BOOKING_COMPLETE_DISTRICT foreign key (DISTRICT_ID)
      references District (DISTRICT_ID)
      on delete restrict on update restrict;

alter table BOOKING
   add constraint FK_BOOKING_FULLFILLE_DOGWALKE foreign key (D_WALKER_ID)
      references DOGWALKER (D_WALKER_ID)
      on delete restrict on update restrict;

alter table BOOKING
   add constraint FK_BOOKING_INCLUDE_SERVICE foreign key (SERVICE_ID)
      references SERVICE (SERVICE_ID)
      on delete restrict on update restrict;

alter table BOOKING
   add constraint FK_BOOKING_INDICATED_DOG foreign key (DOG_ID)
      references Dog (DOG_ID)
      on delete restrict on update restrict;

alter table BOOKING
   add constraint FK_BOOKING_MAKE_CLIENT foreign key (CLIENT_ID)
      references CLIENT (CLIENT_ID)
      on delete restrict on update restrict;

alter table Dog
   add constraint FK_DOG_OWNS_CLIENT foreign key (CLIENT_ID)
      references CLIENT (CLIENT_ID)
      on delete cascade on update restrict;

alter table FEEDBACK
   add constraint FK_FEEDBACK_DESCRIBE_BOOKING foreign key (BOOKING_ID)
      references BOOKING (BOOKING_ID)
      on delete restrict on update restrict;

alter table FEEDBACK
   add constraint FK_FEEDBACK_LEAVE_DOGWALKE foreign key (D_WALKER_ID)
      references DOGWALKER (D_WALKER_ID)
      on delete restrict on update restrict;

alter table FEEDBACK
   add constraint FK_FEEDBACK_MODERATE_ADMIN foreign key (ADMIN_ID)
      references ADMIN (ADMIN_ID)
      on delete restrict on update restrict;

alter table FEEDBACK
   add constraint FK_FEEDBACK_WRITE_CLIENT foreign key (CLIENT_ID)
      references CLIENT (CLIENT_ID)
      on delete restrict on update restrict;

alter table FORM
   add constraint FK_FORM_CHECK_ADMIN foreign key (ADMIN_ID)
      references ADMIN (ADMIN_ID)
      on delete restrict on update restrict;

alter table FORM
   add constraint FK_FORM_FILLIN_DOGWALKE foreign key (D_WALKER_ID)
      references DOGWALKER (D_WALKER_ID)
      on delete cascade on update restrict;

alter table PROVIDE
   add constraint FK_PROVIDE_PROVIDE_DOGWALKE foreign key (D_WALKER_ID)
      references DOGWALKER (D_WALKER_ID)
      on delete cascade on update restrict;

alter table PROVIDE
   add constraint FK_PROVIDE_PROVIDE2_SERVICE foreign key (SERVICE_ID)
      references SERVICE (SERVICE_ID)
      on delete cascade on update restrict;