<?
include_once("../inc/setup.inc.php");

$user = new user();

$action = $email = $pass = "";
if (isset($_REQUEST['action'])) $action = trim($_REQUEST['action']);
if (isset($_REQUEST['email']))  $email = trim($_REQUEST['email']);
if (isset($_REQUEST['pass']))   $pass = trim($_REQUEST['pass']);

if ($action == "signout") {
    $_SESSION['user'] = user::makeHash();
}

if ($email!="" && $pass!="") {
    if ($action == "signin") {
        $user->signIn($email, $pass);
        if ($user->hash) $_SESSION['user'] = $user->hash;
    }
    if ($action == "signup") {
        $user->loadbyHash($_SESSION['user']);
        $user->signUp($email, $pass);
        if ($user->hash) $_SESSION['user'] = $user->hash;
    }
    print json_encode(array("id" => $user->id, "email" => $user->email));
}