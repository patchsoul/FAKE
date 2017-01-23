var root = {}; // root context/object/scope.
root['\\'] = root; // pointer to itself
var stack = {index: -1, array: []};
var statements = {};

function reset_statements() {
    statements.interrupt = 0;
    statements.io_context = "none";
    statements.context = root;
}

function print(msg) {
    console.log(msg);
    addResponseLine(msg, "print");
    return 0;
}

function error(msg) {
    console.error(msg);
    addResponseLine("# "+msg, "error");
    return 1;
}

function add_function(context, character, instructions, fn) {
    if (context[character] !== undefined)
        return error("can't redefine function `"+character+"` in context "+context);
    var obj = {
        name: character,
        fn: fn,
        instructions: instructions // number of instructions which follow the function
    };
    context[character] = obj;
    return obj;
}

add_function(root, 'p', 0, function (stmts, stck) { // pop
    return pop(stck);
});

function duplicate(element) { // deep copy
    switch (typeof element) {
        case 'number':
            return element;
        case 'string':
            return element;
        case 'object':
            if (element.index !== undefined) { // stack
                var length = element.index+1; // or element.array.length ? 
                var new_stack = { index: element.index, array: Array(length) };
                for (var i=0; i<length; ++i)
                    new_stack.array[i] = duplicate(element.array[i]);
                return new_stack;
            } else { // matrix
                var new_matrix = { rows: element.rows, columns: element.columns, array: [] };
                for (var i=0; i<element.rows; ++i) {
                    new_matrix.array[i] = Array(new_matrix.columns);
                    for (var j=0; j<element.columns; ++j)
                        new_matrix.array[i][j] = duplicate(element.array[i]);
                }
                return new_matrix;
            }
    }
    error("could not duplicate "+element);
    return null;
}

add_function(root, 'd', 0, function (stmts, stck) { // duplicate
    if (stck.index < 0)
        return error("need an element on stack to duplicate");
    allocate(stck);
    stck.array[stck.index] = duplicate(stck.array[stck.index-1]);
    return 0;
});

add_function(root, 'y', 0, function (stmts, stck) { // copy (shallow)
    if (stck.index < 0)
        return error("need an element on stack to copy");
    allocate(stck);
    stck.array[stck.index] = stck.array[stck.index-1];
    return 0;
});

add_function(root, 'Y', 0, function (stmts, stck) { // double copy (shallow)
    if (stck.index < 1)
        return error("need two elements on stack to copY");
    allocate(stck);
    stck.array[stck.index] = stck.array[stck.index-2];
    allocate(stck);
    stck.array[stck.index] = stck.array[stck.index-2];
    return 0;
});

add_function(root, '~', 0, function (stmts, stck) { // swap
    if (stck.index < 1)
        return error("need two elements on stack to swap");
    var tmp = stck.array[stck.index];
    stck.array[stck.index] = stck.array[stck.index-1];
    stck.array[stck.index-1] = tmp;
    return 0;
});

add_function(root, 'n', 0, function (stmts, stck) { // number of elements on stack
    allocate(stck);
    stck.array[stck.index] = stck.index;
    return 0;
});

add_function(root, '/', 0, function (stmts, stck) {
    return two_arguments(stmts, stck, divide);
});

add_function(root, '*', 0, function (stmts, stck) {
    return two_arguments(stmts, stck, multiply);
});

add_function(root, '-', 0, function (stmts, stck) {
    return two_arguments(stmts, stck, subtract);
});

add_function(root, '+', 0, function (stmts, stck) {
    return two_arguments(stmts, stck, add);
});

add_function(root, '?', 0, logical_branch( function (stmts, stck, result) {
    if (allocate(stck))
        return 1;
    stck.array[stck.index] = result;
    return 0; 
}));

add_function(root, '!', 2, function (instructions) {
    return logical_branch(function (stmts, stck, result) {
        if (pop(stck))
            return 1;
        instructions[result].fn(stmts, stck);
        return 0; 
    });
});


add_function(root, 'l', 1, function (instructions) {
    return function (stmts, stck) {
        var new_stmts = {interrupt: 0, io_context: stmts.io_context,
            interruptible: instructions[0]};
        instructions[0].fn(new_stmts, stck);
    };
});

add_function(root, 'j', 0, function (stmts, stck) {
    stmts.interrupt = -1; // jump back to beginning
    return 0;
});

add_function(root, 'k', 0, function (stmts, stck) {
    stmts.interrupt = 1; // end/kill function
    return 0;
});

(function () {
    var obj = add_function(root, 'e', 1, null);
    obj.subcontext = {'\\': root};
    obj.fn = function (instructions) {
        return function (stmts, stck) {
            stmts.context = obj.subcontext;
            if (instructions[0].fn(stmts, stck))
                return error("could not execute internal statement");
            stmts.context = root;
            return 0;
        };
    };
})()
