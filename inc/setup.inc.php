<?
session_start();
error_reporting(E_ALL); //^E_NOTICE

include_once("../config/database.live.php");
include_once("../lib/meekrodb.2.3.class.php");
include_once("../inc/user.inc.php");
include_once("../inc/todo.inc.php");

DB::$host = DATABASE_HOST;
DB::$user = DATABASE_USER;
DB::$password = DATABASE_PASSWORD;
DB::$dbName = DATABASE_NAME;
DB::$encoding = 'utf8';