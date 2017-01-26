var root = {'dictionary\\': 1}; // root context/object/scope.
root['\\'] = root; // pointer to itself
var stack = {index: -1, array: []};
var statements = {};
var yet_to_print = [];

function reset_statements() {
    statements.interrupt = 0;
}

function printing(msg) {
    yet_to_print.push(msg);
}

function print(msg) {
    if (yet_to_print.length) {
        msg = yet_to_print.join(" ") + " "+msg;
        yet_to_print.length = 0;
    }
    console.log(msg);
    addResponseLine(msg, "print");
    return 0;
}

function error(msg) {
    console.error(msg);
    addResponseLine("# "+msg, "error");
    return 1;
}

function add_function(context, character, instructions, fn, variable) {
    while (context["dictionary\\"] === undefined) {
        context = context['\\']
        if (context === undefined) {
            error("something horrible happened");
            return { error: "bad", fn: function (stmts, stck) {return 1;} };
        }
    }
    if (context[character] !== undefined) {
        if (context[character].variable === undefined) {
            console.error("context: ", context);
            error("can't redefine function `"+character+"` in this context");
            return { error: "can't redefine", fn: function (stmts, stck) {return 1;} };
        } else if (variable !== undefined) { // we have a variable function already, send back the context for changing.
            return context[character];
        }
        error("can't redefine a variable function as a constant function.  (use Z, not z.)");
        return { error: "can't redefine as const", fn: function (stmts, stck) {return 1;} };
    }
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
        return error("need two elements on stack to swap: ~");
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

add_function(root, '^', 0, function (stmts, stck) {
    return two_arguments(stmts, stck, power);
});

add_function(root, '_', 0, function (stmts, stck) {
    return one_argument(stmts, stck, log_e);
});

add_function(root, '?', 0, logical_branch( function (stmts, stck, result) {
    allocate(stck);
    stck.array[stck.index] = result;
    return 0; 
}));

add_function(root, '&', 0, function (stmts, stck) {
    if (stck.index < 1)
        return error("need two elements on stack to do logical AND: &");
    var value = logical_value(stck.array[stck.index-1]);
    if (value < 0)
        return error("can't get logical value of NOS");
    if (value === 0) {
        pop(stck);
        pop(stck);
        allocate(stck);
        stck.array[stck.index] = 0;
        return 0; 
    }
    value = logical_value(stck.array[stck.index]);
    if (value < 0)
        return error("can't get logical value of TOS");
    pop(stck);
    pop(stck);
    allocate(stck);
    stck.array[stck.index] = value;
    return 0; 
});

add_function(root, '|', 0, function (stmts, stck) {
    if (stck.index < 1)
        return error("need two elements on stack to do logical OR: |");
    var value = logical_value(stck.array[stck.index-1]);
    if (value < 0)
        return error("can't get logical value of NOS");
    if (value === 1) {
        pop(stck);
        pop(stck);
        allocate(stck);
        stck.array[stck.index] = 1;
        return 0; 
    }
    value = logical_value(stck.array[stck.index]);
    if (value < 0)
        return error("can't get logical value of TOS");
    pop(stck);
    pop(stck);
    allocate(stck);
    stck.array[stck.index] = value;
    return 0; 
});

add_function(root, '!', 2, function (instructions) {
    return logical_branch(function (stmts, stck, result) {
        if (pop(stck))
            return 1;
        instructions[result].fn(stmts, stck);
        return 0; 
    });
});

add_function(root, '<', 0, function (stmts, stck) {
    return two_arguments(stmts, stck, less_than);
});

add_function(root, '>', 0, function (stmts, stck) {
    return two_arguments(stmts, stck, greater_than);
});

add_function(root, '=', 0, function (stmts, stck) {
    return two_arguments(stmts, stck, equal);
});

add_function(root, 'l', 1, function (instructions) {
    return function (stmts, stck) {
        var new_stmts = {interrupt: 0, interruptible: instructions[0]};
        return instructions[0].fn(new_stmts, stck);
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
    obj.subcontext = {'\\': root, 'dictionary\\': 1};
    obj.fn = function (instructions) {
        return function (stmts, stck) {
            if (instructions[0].fn(stmts, stck))
                return error("could not execute internal statement");
            return 0;
        };
    };
})();

(function () {
    var obj = add_function(root, 'm', 1, null);
    obj.subcontext = {'\\': root, 'dictionary\\': 'm'};
    obj.fn = function (instructions) {
        return function (stmts0, stck) {
            if (stck.index < 1)
                return error("not enough elements to define matrix");
            if (typeof stck.array[stck.index] !== 'number' || typeof stck.array[stck.index-1] !== 'number')
                return error("NOS and TOS aren't numbers to define rows and columns");
            var rows = stck.array[stck.index-1]
            if (rows <= 0)
                return error("matrix error: rows <= 0");
            if (columns <= 0)
                return error("matrix error: columns <= 0");
            var columns = stck.array[stck.index]; 
            pop(stck);
            pop(stck);
            var stmts = { interrupt: 0, interruptible: instructions[0], index: 0 };
            // initialize the matrix:
            stmts.matrix_index = 0;
            stmts.matrix_size = rows*columns;
            stmts.matrix = { rows: rows, columns: columns, array: Array(rows) };
            for (var i=0; i<rows; ++i)
                stmts.matrix.array[i] = Array(columns);
            // run the internal function and add matrix to stack:
            if (instructions[0].fn(stmts, stck))
                return error("could not execute internal statement");
            allocate(stck);
            stck.array[stck.index] = stmts.matrix;
            // fill remainder of matrix with zeroes:
            while (stmts.matrix_index < stmts.matrix_size) {
                stmts.matrix.array[Math.floor(stmts.matrix_index/columns)][stmts.matrix_index%columns] = 0;
                ++stmts.matrix_index;
            }
            return 0;
        };
    };
    add_function(obj.subcontext, ',', 0, function (stmts, stck) {
        if (stck.index < 0)
            return error("matrix error: nothing on stack to push");
        if (typeof stck.array[stck.index] !== 'number')
            return error("matrix error: could not push non-number to matrix");
        stmts.matrix.array[Math.floor(stmts.matrix_index/stmts.matrix.columns)][stmts.matrix_index%stmts.matrix.columns] = stck.array[stck.index];
        pop(stck);
        if (++stmts.matrix_index >= stmts.matrix_size)
            stmts.interrupt = 1;
        return 0;
    });
    add_function(obj.subcontext, ';', 0, function (stmts, stck) {
        if (stck.index < 0)
            return error("matrix error: nothing on stack to push");
        if (typeof stck.array[stck.index] !== 'number')
            return error("matrix error: could not push non-number to matrix");
        var row = Math.floor(stmts.matrix_index/stmts.matrix.columns);
        var column = stmts.matrix_index%stmts.matrix.columns;
        stmts.matrix.array[row][column++] = stck.array[stck.index];
        pop(stck);
        while (column < stmts.matrix.columns) {
            stmts.matrix.array[row][column++] = 0;
        }
        stmts.matrix_index = (row+1)*stmts.matrix.columns;
        if (stmts.matrix_index >= stmts.matrix_size)
            stmts.interrupt = 1;
        return 0;
    });
})();

add_function(root, ',', 0, function (stmts, stck) {
    printing(print_element(stck.array[stck.index]));
    pop(stck);
    return 0;
});

add_function(root, ';', 0, function (stmts, stck) {
    print(print_element(stck.array[stck.index]));
    pop(stck);
    return 0;
});
