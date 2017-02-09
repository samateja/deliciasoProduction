/*
SQLyog Community v12.2.6 (64 bit)
MySQL - 5.7.14 : Database - deliciaso
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`deliciaso` /*!40100 DEFAULT CHARACTER SET latin1 */;

USE `deliciaso`;

/*Table structure for table `bakers` */

DROP TABLE IF EXISTS `bakers`;

CREATE TABLE `bakers` (
  `Id` int(50) NOT NULL AUTO_INCREMENT,
  `OrganizationName` varchar(30) DEFAULT NULL,
  `Mobile` varchar(30) DEFAULT NULL,
  `Email` varchar(50) DEFAULT NULL,
  `ContactName` varchar(50) DEFAULT NULL,
  `OrganizationAddress` varchar(200) DEFAULT NULL,
  `OrganizationZip` varchar(20) DEFAULT NULL,
  `RegisteredOn` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `VatNo` varchar(200) DEFAULT NULL,
  `ValidUpTo` varchar(20) DEFAULT NULL,
  `LogoPath` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `Id` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

/*Table structure for table `cakeorders` */

DROP TABLE IF EXISTS `cakeorders`;

CREATE TABLE `cakeorders` (
  `Id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `Product_id` int(11) DEFAULT NULL,
  `BakerId` int(11) DEFAULT NULL,
  `Product_amount` varchar(255) DEFAULT NULL,
  `CustomerId` int(11) DEFAULT NULL,
  `OrderId` int(11) DEFAULT NULL,
  `PaymentStatus` int(11) DEFAULT NULL COMMENT '//0 is pending',
  `OrderDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `product_fields_json` longtext,
  `DeliveryStatus` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;

/*Table structure for table `customers` */

DROP TABLE IF EXISTS `customers`;

CREATE TABLE `customers` (
  `Id` int(25) NOT NULL AUTO_INCREMENT,
  `Name` varchar(50) DEFAULT NULL,
  `Email` varchar(50) DEFAULT NULL,
  `Mobile` varchar(50) DEFAULT NULL,
  `Gender` varchar(25) DEFAULT NULL,
  `Address` varchar(500) DEFAULT NULL,
  `Zip` varchar(50) DEFAULT NULL,
  `ReferedBy` varchar(50) DEFAULT NULL,
  `BakerId` int(50) DEFAULT NULL,
  KEY `Id` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

/*Table structure for table `customertags` */

DROP TABLE IF EXISTS `customertags`;

CREATE TABLE `customertags` (
  `Id` int(255) NOT NULL AUTO_INCREMENT,
  `CustomerId` int(255) NOT NULL,
  `TagId` bigint(255) NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `customerIdlinkscustomer` (`CustomerId`),
  KEY `tagidlinkstags` (`TagId`),
  CONSTRAINT `customerIdlinkscustomer` FOREIGN KEY (`CustomerId`) REFERENCES `customers` (`Id`),
  CONSTRAINT `tagidlinkstags` FOREIGN KEY (`TagId`) REFERENCES `tags` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=latin1;

/*Table structure for table `deliveryaddress` */

DROP TABLE IF EXISTS `deliveryaddress`;

CREATE TABLE `deliveryaddress` (
  `Id` int(30) NOT NULL AUTO_INCREMENT,
  `DeliveryAddress` varchar(500) DEFAULT NULL,
  `Zip` varchar(30) DEFAULT NULL,
  `CustomerId` int(30) DEFAULT NULL,
  `BakerId` int(50) DEFAULT NULL,
  KEY `Id` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

/*Table structure for table `orders` */

DROP TABLE IF EXISTS `orders`;

CREATE TABLE `orders` (
  `Id` int(25) NOT NULL AUTO_INCREMENT,
  `DeliveryType` varchar(50) DEFAULT NULL,
  `DeliveryCharge` varchar(50) DEFAULT NULL,
  `Comments` varchar(200) DEFAULT NULL,
  `DeliveryAddressId` int(50) DEFAULT NULL,
  `CustomerId` int(50) DEFAULT NULL,
  `DeliveryDateTime` datetime(6) DEFAULT NULL,
  `PickUpDateTime` datetime(6) DEFAULT NULL,
  `Amount` varchar(50) DEFAULT NULL,
  `BakerId` int(50) DEFAULT NULL,
  `OrderId` int(50) DEFAULT NULL,
  `Order_time` datetime DEFAULT CURRENT_TIMESTAMP,
  KEY `Id` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

/*Table structure for table `otp` */

DROP TABLE IF EXISTS `otp`;

CREATE TABLE `otp` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `UserId` int(11) DEFAULT NULL,
  `OTP` int(11) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `CreatedDateTime` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `payments` */

DROP TABLE IF EXISTS `payments`;

CREATE TABLE `payments` (
  `Id` int(50) NOT NULL AUTO_INCREMENT,
  `PaymentType` varchar(100) DEFAULT NULL,
  `PaidAmount` varchar(50) DEFAULT NULL,
  `NeftTxnNo` varchar(100) DEFAULT NULL,
  `CardTxnNo` varchar(100) DEFAULT NULL,
  `PaymentStatus` varchar(50) DEFAULT NULL,
  `Discount` varchar(50) DEFAULT NULL,
  `CakeOrderId` varchar(50) DEFAULT NULL,
  `BalanceAmount` varchar(50) DEFAULT NULL,
  `PaidDate` date DEFAULT NULL,
  `CancelReason` varchar(250) DEFAULT NULL,
  `CancelledDate` date DEFAULT NULL,
  `BakerId` int(50) DEFAULT NULL,
  `OrderId` int(50) DEFAULT NULL,
  KEY `Id` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

/*Table structure for table `products` */

DROP TABLE IF EXISTS `products`;

CREATE TABLE `products` (
  `product_id` int(11) DEFAULT NULL,
  `baker_id` int(11) DEFAULT NULL,
  `product_fields_json` longtext
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

/*Table structure for table `products_master` */

DROP TABLE IF EXISTS `products_master`;

CREATE TABLE `products_master` (
  `Id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `Product_desc` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=MyISAM AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;

/*Table structure for table `tags` */

DROP TABLE IF EXISTS `tags`;

CREATE TABLE `tags` (
  `Id` bigint(255) NOT NULL AUTO_INCREMENT,
  `TagName` varchar(255) NOT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

/*Table structure for table `users` */

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `Id` int(255) NOT NULL AUTO_INCREMENT,
  `username` varchar(200) DEFAULT NULL,
  `email` varchar(200) DEFAULT NULL,
  `mobile` varchar(200) DEFAULT NULL,
  `password` varchar(200) DEFAULT NULL,
  `bakerId` int(255) NOT NULL,
  `isEmailConfirmed` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
