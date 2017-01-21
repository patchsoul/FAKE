/*
    Javascript Types:
        string
        float
        object
            if (thing.index !== undefined)
                stack // thing.index and thing.array
            else
                matrix // thing.rows thing.columns thing.array
        function
*/
function pop(stck) {
    if (stck.index < 0) {
        return error("nothing to pop");
    }
    // free stck.array[stck.index]
    for (var i=stck.index+1; i<stck.array.length; ++i)
        stck.array[i-1] = stck.array[i];
    stck.array.pop();
    --stck.index;
    return 0;
}

function allocate(stck) {
    ++stck.index;
    for (var i=stck.array.length; i>stck.index; --i)
        stck.array[i] = stck.array[i-1];
    /*
    e.g.
        stck.index was 4, now 5
        stck.array.length = 5
        push just a null at the end (happens below):

    or
        stck.index was 2, now 3
        stck.array.length = 6
        array[6] = array[5]
        array[5] = array[4]
        array[4] = array[3]
        array[3] = null
    */
    stck.array[stck.index] = null;
    return 0;
}

function one_argument(stmts, stck, fs) {
    if (stck.index < 0)
        return error("not enough on stack for single argument");
    switch (typeof stck.array[stck.index]) {
        case 'number':
            return fs[0](stmts, stck);
        case 'string':
            return fs[1](stmts, stck);
        case 'object':
            if (stck.array[stck.index].index !== undefined)
                return fs[2](stmts, stck);
            else
                return fs[3](stmts, stck);
    }
    return error("somehow "+stck.array[stck.index]+" is not a valid float, string, stack, or matrix in single argument");
}

function print_stack(e) {
    if (e.array.length === 0)
        return "{}";
    var i=-1;
    var text = ["{"];
    if (e.index < 0) {
        error("not expecting a negative index for a non-null stack");
        text.push("e???");
    } else {
        while (++i<e.index) text.push(print_element(e.array[i]));
        text.push('e'+print_element(e.array[i]));
    }
    while (++i<e.array.length) text.push(print_element(e.array[i]));
    text.push("}");
    return text.join(" ");
}

function print_matrix(e) {
    var text = ["["];
    for (var i=0; i<stck.array[stck.index].rows; ++i) {
        text.push(stck.array[stck.index][i].join(", "));
        text.push(";\r\n");
    }
    text.push("]"); 
    return text.join("");
}

function print_element(e) {
    switch (typeof e) {
        case 'number':
            return e.toString();
        case 'string':
            return "'"+e+"'";
        case 'object':
            if (e.index !== undefined)
                return print_stack(e);
            else
                return print_matrix(e);
    }
    console.error(e);
    return error("did not get a valid float, string, stack, or matrix in print element");
}

function two_arguments(stmts, stck, fs) {
    if (stck.index < 1)
        return error("not enough on stack for two arguments");
    var a;
    switch (typeof stck.array[stck.index-1]) {
        case 'number':
            a = 0;
            break;
        case 'string':
            a = 1;
            break;
        case 'object':
            if (a.index !== undefined)
                a = 2;
            else
                a = 3;
            break;
        default:
            return error("somehow "+stck.array[stck.index-1]+" is not a valid float, string, stack, or matrix in two arguments");
    }
    var b;
    switch (typeof stck.array[stck.index]) {
        case 'number':
            b = 0;
            break;
        case 'string':
            b = 1;
            break;
        case 'object':
            if (b.index !== undefined)
                b = 2;
            else
                b = 3;
            break;
        default:
            return error("somehow "+stck.array[stck.index]+" is not a valid float, string, stack, or matrix in two arguments");
    }
    return fs[a+4*b](stmts, stck);
}

