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
    $.getJSON("ajax/todo.php", function( data ) {
        $.each( data, function( key, val ) {
            appendTodo(val.id, val.title, val.completed);
        });
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
    if (h=="#/active") {
        $(".todo-list li").hide();
        $(".todo-list li").not(".completed").show();
    }
    if (h=="#/completed") {
        $(".todo-list li").hide();
        $(".todo-list li.completed").show();
    }
    if (h=="#/") {
        $(".todo-list li").show();
    }
    $('.filters a.selected').removeClass("selected");
    $('.filters a[href="'+h+'"]').addClass("selected");
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

$(document).ready(function() {
    initTodo();

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
