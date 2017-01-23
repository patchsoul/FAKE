function get_function_name(text, j) {
    if (text[j] === '`') {
        var j_start = ++j;
        var escaped = false;
        while (true) {
            if (j >= text.length) {
                error("run on `` statement, missing final `");
                return { final_j: text.length, error: "run on `" };
            } else if (escaped) {
                escaped = false;
            } else if (text[j] === '`') {
                break;
            } else if (text[j] === '\\') {
                escaped = true;
            }
            ++j;
        }
        return { final_j: j, name: text.substring(j_start, j) }; // keep text[j] == '`'
    }
    return { final_j: j, name: text[j] }; // purposely keep j fixed, increment later
}

function get_number_function(text, j) {
    // text[j] must be the start of a valid number
    var sign = 1;
    if (text[j] === '-') {
        sign = -1;
        ++j;
    }
    var j_start = j;
    var found_period = false;
    while (++j < text.length) {
        var ascii = text.charCodeAt(j) - 48; // 48 === '0'
        if (ascii < 0 || ascii >= 10) {
            if (ascii === -2) { // period, 46 === '.'
                if (found_period)
                    break;
                else
                    found_period = true;
            }
            else // not a number or a period
                break;
        }
    }
    var obj = { 
        final_j: j-1, 
        value: parseFloat(text.substring(j_start, j))*sign,
        fn: function (stmts, stck) {
            if (allocate(stck))
                return 1;
            stck.array[stck.index] = obj.value;
            return 0;
        }
    };
    return obj;
}

function make_quote_function(quote, split, internal_fns) {
    var obj = { split: split, internal_fns: internal_fns };
    obj.fn = function (stmts, stck) {
        for (var i=0; i<internal_fns.length; ++i) {
            if (obj.internal_fns[i].fn(stmts, stck) || 
                stck.index < 0 || 
                (obj.split[2*i+1] = print_element(stck.array[stck.index])) === 1)
                return error("error executing function "+i+" in quotes "+quote)
            pop(stck);
        }
        if (quote === '"') { // print string
            print(obj.split.join(""));
        } else { // push to stack string (with quote ')
            allocate(stck);
            stck.array[stck.index] = obj.split.join("");
        }
        return 0;
    };
    return obj;
}

function next_instruction(context, text, j) {
    while (j < text.length) {
        var back_slashed = false;
        switch (text[j]) {
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                return get_number_function(text, j);
            case ' ':
            case '\n':
            case '\r':
            break;
            case '#':
                while (++j < text.length && text[j] !== '\n') {}
            break;
            case '	':
                return { final_j: j, fn: function (stmts, stck) {} };
            case '(':
                var obj = compile_function(context, text, j+1, ')');
                if (obj.error !== undefined || text[obj.final_j] !== ')') {
                    error("bad ( statement.  may need closing )");
                    return { final_j: text.length, error: "run on (" };
                }
                obj.delta_index = 1;       
                return obj;
            case '[':
                var obj = compile_function(context, text, j+1, ']');
                if (obj.error !== undefined || text[obj.final_j] !== ']') {
                    error("bad [ statement.  may need closing ]");
                    return { final_j: text.length, error: "run on [" };
                }
                return obj;
            case '{':
                var obj = compile_function(context, text, j+1, '}');
                if (obj.error !== undefined || text[obj.final_j] !== '}') {
                    error("bad { statement.  may need closing }");
                    return { final_j: text.length, error: "run on {" };
                }
                obj.internal_fn = obj.fn;
                obj.fn = function (stmts, stck) {
                    if (allocate(stck))
                        return 1;
                    var new_stack = { array: [], index: -1 };
                    if (obj.internal_fn(stmts, new_stack))
                        return error("could not build stack inside {}");
                    stck.array[stck.index] = new_stack;
                    return 0;
                };
                j = obj.final_j;
                delete obj.final_j;
                return obj;
            case "'":
            case '"':
                var quote = text[j];
                var j_start = ++j;
                var escaped = false;
                var internal_fns = [];
                var split = [];
                while (true) {
                    if (j >= text.length) {
                        error("run on string, missing final "+quote);
                        return { final_j: text.length, error: "run on "+quote };
                    } else if (escaped) {
                        escaped = false;
                    } else if (text[j] === quote) {
                        break;
                    } else if (text[j] === '\\') {
                        escaped = true;
                    } else if (text[j] === '`') {
                        split.push(text.substring(j_start, j));
                        var obj = next_instruction(context, text, j)
                        if (obj.error !== undefined) {
                            error("cannot execute function in backticks in quotes "+quote);
                            return { final_j: text.length, error: "bad fn in "+quote };
                        }
                        j = obj.final_j;
                        delete obj.final_j;
                        internal_fns.push(obj);
                        split.push(null);
                        j_start = j+1;
                    }
                    ++j;
                }
                split.push(text.substring(j_start, j));
                var obj = make_quote_function(quote, split, internal_fns);
                if (obj.error !== undefined) {
                    error("couldn't create quote function");
                    return { final_j: j, error: "couldn't create function "+quote };
                }
                obj.final_j = j;
                return obj;
            break;
            case '\\':
                do {
                    context = context['\\'];
                    ++j;
                    if (j >= text.length) {
                        error("can't complete backslashed function");
                        return { final_j: text.length, fn: function (stmts, stck) {}, error: "can't complete backslash" };
                    }
                } while (text[j] === '\\');
                back_slashed = true;
            // NO BREAK, go into default:
            default:
                if (!back_slashed && text[j] === '-' && j+1 < text.length) {
                    var ascii = text.charCodeAt(j+1) - 48; // 48 === '0'
                    if (ascii >= 0 && ascii < 10) {
                        // get number
                        return get_number_function(text, j);
                    }
                }
                var fn_name_obj = get_function_name(text, j);
                if (fn_name_obj.error !== undefined) {
                    error("can't complete next instruction");
                    return { final_j: text.length, fn: function (stmts, stck) {}, error: "can't complete instruction" };
                }
                j = fn_name_obj.final_j;
                var fn_header = context[fn_name_obj.name];
                while (fn_header === undefined) {
                    if (context['\\'] === context) {
                        error("undefined character `"+fn_name_obj.name+"` at position "+j);
                        return { final_j: text.length, fn: function (stmts, stck) {}, error: "undefined character `"+fn_name_obj.name+"`" };
                    
                    }
                    context = context['\\'];
                    fn_header = context[fn_name_obj.name];
                }
                if (fn_header.instructions === 0) {
                    // with no arguments, you can just send the pointer to the function, but add final_j
                    return { fn: fn_header.fn, final_j: j };
                }
                // otherwise make a copy of the function 
                // this creates an "instance" of the function, with a specific
                // argument set.
                var new_fn = { internal_fn: fn_header.fn, instructions: [] };
                if (fn_header.subcontext)
                    context = fn_header.subcontext;
                for (var i=0; i<fn_header.instructions; ++i) {
                    var j_start = j+1;
                    var new_arg_fn = next_instruction(context, text, ++j)
                    if (new_arg_fn.error !== undefined) {
                        error("could not get instructions for function "+fn_name_obj.name);
                        return { final_j: text.length, fn: function (stmts, stck) {}, error: "not enough instructions" };
                    
                    }
                    j = new_arg_fn.final_j;
                    delete new_arg_fn.final_j;
                    new_fn.instructions.push(new_arg_fn);
                }
                new_fn.final_j = j;
                new_fn.fn = new_fn.internal_fn(new_fn.instructions);
                return new_fn;
            break;
        }
        ++j;
    }
    return { final_j: j+1, fn: function (stmts, stck) {}, error: "end of text" };
}

function make_function_from_array(fn_array) {
    var obj = {
        fn_array: fn_array,
        delta_index: 0,
        fn: function (stmts, stck) {
            if (stmts.interrupt && stmts.interruptible.fn !== obj.fn)
                return 0; 
            var j=-1;
            stck.index -= obj.delta_index;
            while (++j < obj.fn_array.length) {
                if (obj.fn_array[j].fn(stmts, stck)) {
                    return error("cannot finish function array");
                }
                if (stmts.interrupt) {
                    if (stmts.interruptible.fn !== obj.fn)
                        break;
                    if (stmts.interrupt < 0) {
                        j = -1;
                        stmts.interrupt = 0;
                        continue;
                    }
                    stmts.interrupt = 0;
                    break;
                }
            }
            stck.index += obj.delta_index;
            return 0;
        }
    }
    return obj;
}

function compile_function(context, text, j, until) {
    var fn_array = [];
    while (j < text.length) {
        switch (text[j]) {
            case ' ':
            case '\n':
            case '\r':
            case '	':
            break;
            case '#':
                while (++j < text.length && text[j] !== '\n') {}
            break;
            case until:
                var obj = make_function_from_array(fn_array);
                obj.final_j = j;
                return obj;
            default:
                var fn = next_instruction(context, text, j);
                if (fn.error !== undefined) {
                    error("error compiling, couldn't get next instruction");
                    return { final_j: j, fn: function (stmts, stck) {}, error: "couldn't get next instruction" };
                }
                j = fn.final_j;
                delete fn.final_j;
                fn_array.push(fn);
            break;
        }
        ++j;
    }
    var obj = make_function_from_array(fn_array);
    obj.final_j = j;
    return obj;
}

function parse(text) {
    reset_statements();
    var fn = compile_function(root, text, 0, null);
    if (fn.error !== undefined) {
        error("couldn't parse text");
        return fn;
    }
    return fn;
}
