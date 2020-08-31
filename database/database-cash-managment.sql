drop database if exists cash_managment;
create database cash_managment char set utf8;
use cash_managment;
select database();

create table users (
	id int not null primary key auto_increment,
    first_name varchar(255) not null,
    last_name varchar(255) not null,
    login varchar(255) not null,
    email varchar(50) not null,
    password varchar(255) not null,
    icon varchar(255),
    created_at timestamp  default CURRENT_TIMESTAMP(),
    last_visit timestamp  default CURRENT_TIMESTAMP(),
    admin boolean default false
);

create table user_finance(
	id int not null primary key auto_increment,
    balance int  default 0,
    expenses int  default 0,
    income int  default 0,
    user_id int not null
);
alter table user_finance add foreign key (user_id) references users(id);

create table user_savings (
	id int not null primary key auto_increment,
    name varchar(50) not null,
    img varchar(255) not null,
    amount int default 0,
    user_id int not null
);
alter table user_savings add foreign key (user_id) references users(id);

create table savings_options(
	id int not null primary key auto_increment,
    name varchar(255) not null
);

create table user_spends (
	id int not null primary key auto_increment,
    name varchar(50) not null,
    img varchar(255) not null,
    amount int default 0,
    savingId int not null,
    user_id int not null
);
alter table user_spends add foreign key (user_id) references users(id);
create table spends_options(
	id int not null primary key auto_increment,
    name varchar(255) not null
);

insert into users (first_name, last_name, login, email, password, admin) values 
    ("Misha", 'Xodanych', "admin", "misha@mail.ru", "admin",  true),
    ("Sasha", 'Hornyak',"agent", "sasha@mail.ru", "agent", false);

insert into user_finance(balance,expenses,income,user_id) values 
	(0,0,0,1),
	(0,0,0,2);
    
insert into savings_options(name) value
	('cash'),('bank');
insert into spends_options(name) value
	('girlfriend'),('car repair'),('animal'),('food'),('internet'),('tv');
    
DROP EVENT IF EXISTS clearData;
delimiter |
CREATE EVENT clearData
	ON schedule every '1' month
    DO
begin
	delete from user_spends;
    update user_finance set expenses = 0, income = 0;
end	|
delimiter ;


