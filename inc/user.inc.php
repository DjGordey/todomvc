<?
class user {
    public $id;
    public $hash;

    public static function makeHash() {
        return md5("iamhere" . time() . "tosave");
    }

    public function __construct($hash) {
        $row = DB::queryFirstRow("SELECT * FROM user WHERE hash = %s", $hash);
        if ($row) {
            $this->hash = $row['hash'];
            $this->id = $row['id'];
        }
        else {
            DB::insert('user', array(
                'hash' => $hash,
            ));
            $this->hash = $hash;
            $this->id = DB::insertId();
        }
    }
}