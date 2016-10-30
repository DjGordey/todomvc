//item editing
var edit = 0;

//add html item to list
function appendTodo(id, txt, completed) {
    var li = document.createElement('li');
    var d = document.createElement('div');
    $(d).addClass("view");
    var i = document.createElement('input');
    $(i).addClass("toggle").attr("type", "checkbox").val(id);
    if (completed==1) {
        $(li).addClass("completed");
        $(i).prop('checked', true);
    }
    $(d).append(i);
    var l = document.createElement('label');
    $(l).text(txt);
    $(d).append(l);
    var b = document.createElement('button');
    $(b).addClass("destroy");
    $(d).append(b);
    $(li).append(d);
    var e = document.createElement('input');
    $(e).addClass("edit").val(txt);
    $(li).append(e);
    $(".todo-list").append(li);
}

//first init
function initTodo() {
    $(".todo-list").html("");
    $.getJSON("ajax/todo.php", function( data ) {
        $.each( data.list, function( key, val ) {
            appendTodo(val.id, val.title, val.completed);
        });
        if (data.user.email) {
            $(".guest").hide();
            $(".user").show();
            $("#hello_user").text("Hello, "+data.user.email);
            $(".signup").hide();
            $(".signin").hide();
        }
        countTodo();
    });
}

//count items
function countTodo() {
    var c = $(".todo-list li").not(".completed").length;
    $(".todo-count strong").text(c);
    if (c>0) $(".toggle-all").prop('checked', false);
    else $(".toggle-all").prop('checked', true);
    if ($(".todo-list li.completed").length>0) $(".clear-completed").show();
    else $(".clear-completed").hide();
    if ($(".todo-list li").length>0) {
        $(".footer").show();
        $(".toggle-all").show();
    }
    else {
        $(".footer").hide();
        $(".toggle-all").hide();
    }
    checkFilter();
}

//activate filters
function checkFilter() {
    var h=location.hash;
    if (h=="") return;
    var f=0;
    if (h=="#/active") {
        $(".todo-list li").hide();
        $(".todo-list li").not(".completed").show();
        f=1;
    }
    if (h=="#/completed") {
        $(".todo-list li").hide();
        $(".todo-list li.completed").show();
        f=1;
    }
    if (h=="#/") {
        $(".todo-list li").show();
        f=1;
    }
    if (f) {
        $('.filters a.selected').removeClass("selected");
        $('.filters a[href="' + h + '"]').addClass("selected");
        $(".signin").hide();
        $(".signup").hide();
        return false;
    }

    if (h=="#/signup") {
        $(".signin").hide();
        $(".signup").show();
    }
    if (h=="#/signin") {
        $(".signup").hide();
        $(".signin").show();
    }
    if (h=="#/signout") {
        $.post("/ajax/user.php", {action: "signout"}, function(data) {
            $(".guest").show();
            $(".user").hide();
            $("#hello_user").text();
            location.hash="";
            initTodo();
        });
    }
}

//update item
function updateTodo(text) {
    if (edit>0) {
        $.post("/ajax/todo.php", {edit: edit, title: text}, function () {
            edit = 0;
            $(".todo-list li.editing label").text(text);
            $(".todo-list li.editing").removeClass("editing");
        });
    }
}

function isEmail(email) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
}

$(document).ready(function() {
    initTodo();

    $("#dosignup").click(function() {
        var e=$.trim($(".signup input[name='email']").val());
        var p1=$.trim($(".signup input[name='pass']").val());
        var p2=$.trim($(".signup input[name='pass2']").val());
        if (e=="" || p1=="" || p2=="") {
            alert("All fields are required");
            return false;
        }
        if (!isEmail(e)) {
            alert("Incorrect email");
            return false;
        }
        if (p1!=p2) {
            alert("Confirm password correctly");
            return false;
        }
        $.post("/ajax/user.php", {action: "signup", email: e, pass: p1}, function(data) {
            if (data.id>0) {
                $(".guest").hide();
                $(".user").show();
                $("#hello_user").text("Hello, "+data.email);
                $(".signup").hide();
                $(".signin").hide();
                location.hash="";
                $(".signup input[name='email']").val("");
                $(".signup input[name='pass']").val("");
                $(".signup input[name='pass2']").val("");
                initTodo();
            }
            else {
                alert("Sign up error");
            }
        }, "json");
    });

    $("#dosignin").click(function() {
        var e=$.trim($(".signin input[name='email']").val());
        var p=$.trim($(".signin input[name='pass']").val());
        if (e=="" || p=="") {
            alert("All fields are required");
            return false;
        }
        if (!isEmail(e)) {
            alert("Incorrect email");
            return false;
        }
        $.post("/ajax/user.php", {action: "signin", email: e, pass: p}, function(data) {
            if (data.id>0) {
                $(".guest").hide();
                $(".user").show();
                $("#hello_user").text("Hello, "+data.email);
                $(".signup").hide();
                $(".signin").hide();
                location.hash="";
                $(".signin input[name='email']").val("");
                $(".signin input[name='pass']").val("");
                initTodo();
            }
            else {
                alert("Your email/password was incorrect");
            }
        }, "json");
    });

    //add new item
    $('.new-todo').keypress(function(e) {
        var key = e.which;
        if (key == 13) {
            var v = $.trim($(this).val());
            if (v!="") {
                $(this).val("");
                $.post("/ajax/todo.php", {add: v}, function(id) {
                    appendTodo(id, v);
                    countTodo();
                });
            }
        }
    });

    //clear completed items
    $('.clear-completed').click(function() {
        $.post("/ajax/todo.php", {clearcompleted: 1 }, function() {
            $(".todo-list li.completed").each(function(i, el) {
                el.remove();
            });
            countTodo();
        });
    });

    //delete item
    $(document).on("click", '.destroy', function (e) {
        var li = $(this).closest("li");
        var id = li.find(".toggle").val();
        $.post("/ajax/todo.php", {delete: id }, function() {
            li.remove();
            countTodo();
        });
    });

    //edit mode on
    $(document).on("dblclick", '.view', function (e) {
        $(this).closest("li").addClass("editing");
        $(this).closest("li").find(".edit").focus();
        edit = $(this).closest("li").find(".toggle").val();
    });

    //edit mode off onclick any place
    $(document).click(function(e) {
        if (edit>0 && !$(e.target).hasClass('edit')) {
            var text = $(".todo-list li.editing .edit").val();
            updateTodo(text);
        }
    });

    //edit mode off on enter
    $(document).on("keypress", '.edit', function (e) {
        var key = e.which;
        if (key == 13) {
            updateTodo($(this).val());
        }
    });

    //items mass toggle status
    $(document).on("click", '.toggle-all', function (e) {
        if ($(this).is(":checked")) {
            $.post("/ajax/todo.php", {allcompleted: 1 }, function() {
                $(".todo-list li .toggle").prop('checked', true);
                $(".todo-list li").addClass("completed");
                countTodo();
            });
        }
        else {
            $.post("/ajax/todo.php", {alluncompleted: 1 }, function() {
                $(".todo-list li .toggle").prop('checked', false);
                $(".todo-list li").removeClass("completed");
                countTodo();
            });
        }
    });

    //item toggle status
    $(document).on("click", '.toggle', function (e) {
        var th = $(this);
        if ($(this).is(":checked")) {
            $.post("/ajax/todo.php", {completed: th.val() }, function() {
                th.closest("li").addClass("completed");
                countTodo();
            });
        }
        else {
            $.post("/ajax/todo.php", {uncompleted: th.val() }, function() {
                th.closest("li").removeClass("completed");
                countTodo();
            });
        }
    });

    //watch hash for filters
    $(window).on('hashchange', function() {
        checkFilter();
    }).trigger("hashchange");

});
