<?
include_once("../inc/setup.inc.php");

$todomvc_hash = null;
if (isset($_COOKIE['todomvc'])) $todomvc_hash = $_COOKIE['todomvc'];
else {
    $todomvc_hash = User::makeHash();
    setcookie("todomvc", $todomvc_hash, strtotime("+1 year"), "/", ".".$_SERVER['HTTP_HOST']);
}

$user = new user($todomvc_hash);
$todo = new todo();


if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    //delete item
    if (isset($_REQUEST['delete'])) {
        $todo->get((int)$_REQUEST['delete'], $user->id);
        if ($todo->id) $todo->delete();
        die();
    }
    //make item completed
    if (isset($_REQUEST['completed'])) {
        $todo->get((int)$_REQUEST['completed'], $user->id);
        if ($todo->id) {
            $todo->completed = TODO_COMPLETED;
            $todo->save();
        }
        die();
    }
    //make item uncompleted
    if (isset($_REQUEST['uncompleted'])) {
        $todo->get((int)$_REQUEST['uncompleted'], $user->id);
        if ($todo->id) {
            $todo->completed = TODO_NOT_COMPLETED;
            $todo->save();
        }
        die();
    }
    //clear all completed
    if (isset($_REQUEST['clearcompleted'])) {
        $todo->clearCompleted($user->id);
        die();
    }
    //add item
    if (isset($_REQUEST['add'])) {
        $todo->title = trim($_REQUEST['add']);
        $todo->user_id = $user->id;
        $todo->save();
        print $todo->id;
        die();
    }
    //update item
    if (isset($_REQUEST['edit'])) {
        $todo->get((int)$_REQUEST['edit'], $user->id);
        if ($todo->id) {
            $todo->title = trim($_REQUEST['title']);
            $todo->save();
        }
        die();
    }
    //make all completed
    if (isset($_REQUEST['allcompleted'])) {
        $todo->updateAll($user->id, TODO_COMPLETED);
        die();
    }
    //make all uncompleted
    if (isset($_REQUEST['alluncompleted'])) {
        $todo->updateAll($user->id, TODO_NOT_COMPLETED);
        die();
    }
}
//load list of items
$todos = $todo->getList($user->id);
print json_encode($todos);