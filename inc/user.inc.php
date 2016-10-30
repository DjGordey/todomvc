<?
class user {
    public $id;
    public $hash;
    public $email;
    public $password;

    public static function makeHash() {
        return md5("iamhere" . time() . "tosave");
    }

    public static function makeHashPass($pass) {
        return md5("iamhere" . $pass . "topass");
    }

    public function save() {
        if ($this->id)
            $this->update();
        else
            $this->insert();
    }

    public function insert() {
        DB::insert('user', array(
            'hash' => $this->hash,
            'email' => $this->email,
            'password' => $this->password
        ));
        $this->id = DB::insertId();
    }

    public function update() {
        DB::update('user', array(
            'hash' => $this->hash,
            'email' => $this->email,
            'password' => $this->password
        ), "id = %i", $this->id);
    }

    public function row($row) {
        foreach ($row as $k=>$v)
            if (property_exists($this, $k))
                $this->$k = $v;
    }

    //return user if exists, if not create as guest
    public function loadbyHash($hash) {
        $row = DB::queryFirstRow("SELECT * FROM user WHERE hash = %s", $hash);
        if ($row) {
            $this->row($row);
        }
        else {
            $this->hash = $hash;
            $this->save();
        }
    }

    //sign in by email and pass
    public function signIn($email, $pass) {
        $row = DB::queryFirstRow("SELECT * FROM user WHERE email = %s and password = %s", $email, self::makeHashPass($pass));
        if ($row) {
            $this->row($row);
        }
    }

    //sign up by email and pass
    public function signUp($email, $pass) {
        $this->email = $email;
        $this->password = self::makeHashPass($pass);
        $this->save();
    }
}