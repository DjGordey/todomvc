<?
define('TODO_COMPLETED', 1);
define('TODO_NOT_COMPLETED', 0);

class todo {
    public $id;
    public $title;
    public $user_id;
    public $completed = TODO_NOT_COMPLETED;

    public function get($id, $user_id) {
        $row = DB::queryFirstRow("SELECT * FROM todo WHERE id=%i and user_id = %i", $id, $user_id);
        if ($row) {
            $this->id = $row['id'];
            $this->title = $row['title'];
            $this->user_id = $row['user_id'];
            $this->completed = $row['completed'];
        }
    }

    public function clearCompleted($user_id) {
        DB::delete('todo', "completed = %i and user_id = %i", TODO_COMPLETED, $user_id);
    }

    public function updateAll($user_id, $completed) {
        DB::update('todo', array("completed" => $completed), "user_id = %i", $user_id);
    }

    public function getList($user_id) {
        return DB::query("SELECT * FROM todo WHERE user_id = %i", $user_id);
    }

    public function save() {
        if ($this->id)
            $this->update();
        else
            $this->insert();
    }

    public function insert() {
        DB::insert('todo', array(
            'title' => $this->title,
            'user_id' => $this->user_id,
            'completed' => $this->completed
        ));
        $this->id = DB::insertId();
    }

    public function update() {
        DB::update('todo', array(
            'title' => $this->title,
            'completed' => $this->completed
        ), "id = %i", $this->id);
    }

    public function delete() {
        DB::delete('todo', "id = %i", $this->id);
    }

}