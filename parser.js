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

function make_dictionary_function(context, length, index) {
    return {
        fn: function (stmts, stck) {
            if (stck.index < 0)
                return error("nothing on stack, can't define a dictionary");
            if (typeof stck.array[stck.index] !== 'string')
                return error("can't define function based on TOS of type "+(typeof stck.array[stck.index]));
            var obj = add_function(context, stck.array[stck.index], length, null);
            if (obj.error !== undefined)
                return error("can't make dictionary function");
            pop(stck);
            obj.subcontext = {'\\': context, 'dictionary\\': 1};
            obj.fn = function (instructions) {
                return function (stmts1, stck1) {
                    if (instructions[index].fn(stmts1, stck1))
                        return error("could not execute internal statement");
                    return 0;
                };
            };
            return 0;
        } 
    };
}

function make_zero_instruction_function(context, text, j) {
    // text[j] should be 'z'
    var next_inst = next_instruction(context, text, j+1);
    if (next_inst.error !== undefined)
        return { final_j: text.length, fn: function (stmts, stck) {}, error: "unfinished z-function definition" };
    var obj = {final_j: next_inst.final_j, internal_fn: next_inst.fn};
    obj.fn = function (stmts, stck) {
        if (stck.index < 0)
            return error("nothing on stack, can't define a z-function");
        if (typeof stck.array[stck.index] !== 'string')
            return error("can't define function based on TOS of type "+(typeof stck.array[stck.index]));
        // overwrite the context
        var obj1 = add_function(context, stck.array[stck.index], 0, function (stmts1, stck1) {
            return obj.internal_fn(stmts1, stck1);
        });
        if (obj1.error !== undefined)
            return error("can't make z-function");
        pop(stck);
        // nullify the function, it has defined something
        return 0;
    };
    return obj;
}

function make_zero_instruction_variable_function(context, text, j) {
    // text[j] should be 'Z'
    var next_inst = next_instruction(context, text, j+1);
    if (next_inst.error !== undefined)
        return { final_j: text.length, fn: function (stmts, stck) {}, error: "unfinished z-function definition" };
    while (context["dictionary\\"] === undefined) {
        context = context['\\']
        if (context === undefined) {
            error("something horrible happened");
            return { final_j: text.length, error: "cannot define an object in this context", fn: function (stmts, stck) { return 1; } };
        }
    }
    var obj = {final_j: next_inst.final_j, internal_fn: next_inst.fn};
    obj.fn = function (stmts, stck) {
        if (stck.index < 0)
            return error("nothing on stack, can't define a z-function");
        if (typeof stck.array[stck.index] !== 'string')
            return error("can't define function based on TOS of type "+(typeof stck.array[stck.index]));
        var name = stck.array[stck.index];
        // overwrite the context
        var obj1 = add_function(context, name, 0, function (stmts1, stck1) {
            return context[name].internal_fn(stmts1, stck1);
        }, 1); // send in "variable" at the end.
        if (obj1.error !== undefined)
            return error("can't make Z-function");
        obj1.internal_fn = obj.internal_fn;
        obj1.variable = true;
        pop(stck);
        // nullify the function, it has defined something
        return 0;
    };
    return obj;
}

function make_function_with_instructions(context, text, j, instructions) {
    // need to insert into the context the instruction characters in "instructions".
    // though they're more like placeholders...
    var obj = { subcontext: { '\\': context }, subinstructions: [], instructions: 0 };
    instructions.forEach(function (element, index) {
        obj.subcontext[element] = { 
            fn: function (stmts, stck) {
                return obj.subinstructions[index].fn(stmts, stck); 
            },
            instructions: 0 
        };
    });
    // this is a bit of an hack -- while it's ok for javascript, which is single-threaded,
    // this definition would be bad for multiple threads.  in each invocation of the function,
    // the instructions are bound to a global variable (obj.subinstructions); see below.
    var next_inst = next_instruction(obj.subcontext, text, j);
    if (next_inst.error !== undefined)
        return { final_j: text.length, fn: function (stmts, stck) {}, error: "unfinished function definition" };
    obj.final_j = next_inst.final_j;
    obj.internal_fn = next_inst.fn;
    obj.fn = function (stmts, stck) {
        if (stck.index < 0)
            return error("nothing on stack, can't define a function");
        if (typeof stck.array[stck.index] !== 'string')
            return error("can't define function based on TOS of type "+(typeof stck.array[stck.index]));
        var obj1 = add_function(context, stck.array[stck.index], instructions.length, null);
        if (obj1.error !== undefined)
            return error("can't make multi-instruction function");
        pop(stck);
        obj1.subcontext = { '\\': context, 'dictionary\\': 1 };
        obj1.fn = function (instructions1) {
            // here we bind the instructions to the global variable obj.subinstructions:
            for (var i=0; i<instructions1.length; ++i)
                obj.subinstructions[i] = instructions1[i];
            return function (stmts1, stck1) {
                return obj.internal_fn(stmts1, stck1);
            };
        };
        // nullify the function, it has defined something
        return 0;
    };
    return obj;
}

function make_function(context, text, j) {
    var instruction_dict = { 'a': 1, 'b': 1, 'c': 1 };
    var instructions = [ text[j] ];
    instruction_dict[text[j]] = 0;
    var index;
    while (++j < text.length) {
        if (instruction_dict[text[j]] === 1) {
            instruction_dict[text[j]] = 0;
            instructions.push(text[j]);
        } else if ((index=instructions.indexOf(text[j])) >= 0) {
            // we've completed the instruction using a single instruction from the branches.
            if (instructions.length > 1) {
                console.error("didn't expect a dictionary with more than one instruction.  use, e.g., 'A'aa, not 'B'aba");
                console.error("ultimately, however, you're the boss, so we'll go with it...");
            }
            // this is creating a dictionary
            var obj = make_dictionary_function(context, instructions.length, index);
            obj.final_j = j;
            return obj;
        } else {
            var obj = make_function_with_instructions(context, text, j, instructions);
            if (obj.error !== undefined) {
                error("problem making function");
                break;
            }
            return obj;
        }
    }
    return { final_j: text.length, fn: function (stmts, stck) {}, error: "can't complete function definition" };
}

function next_instruction(context, text, j) {
    var original_context = context;
    while (j < text.length) {
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
                    allocate(stck);
                    var new_stack = { array: [], index: -1 };
                    if (obj.internal_fn(stmts, new_stack))
                        return error("could not build stack inside {}");
                    stck.array[stck.index] = new_stack;
                    return 0;
                };
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
            case 'z':
                return make_zero_instruction_function(original_context, text, j);
            case 'Z':
                return make_zero_instruction_variable_function(original_context, text, j);
            case 'a':
            case 'b':
            case 'c':
                // check if these are defined (if we're in a function definition)
                // or if we need to define a function:
                if (context[text[j]] === undefined) {
                    while (true) {
                        if (context === context['\\']) {
                            return make_function(original_context, text, j);
                        }
                        context = context['\\'];
                        if (context[text[j]] !== undefined)
                            break;
                    }
                }
            // NO BREAK, go into default:
            default:
                var back_slashed = false;
                if (text[j] === '\\') {
                    do {
                        context = context['\\'];
                        ++j;
                        if (j >= text.length) {
                            error("can't complete backslashed function");
                            return { final_j: text.length, fn: function (stmts, stck) {}, error: "can't complete backslash" };
                        }
                    } while (text[j] === '\\');
                    back_slashed = true;
                }
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
                if (fn_header.subcontext) {
                    original_context = fn_header.subcontext;
                }
                var new_fn = { internal_fn: fn_header.fn, instructions: [] };
                for (var i=0; i<fn_header.instructions; ++i) {
                    var j_start = j+1;
                    var new_arg_fn = next_instruction(original_context, text, ++j)
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
                    if (stmts.interruptible === undefined) {
                        if (stmts.interrupt > 0)
                            return error("this is NOT a loop, cannot break out of it");
                        else
                            return error("this is NOT a loop, cannot jump back to beginning of it");
                    }
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
                if (context['dictionary\\'] === 'm') {
                    // check if the last function was "push number", if so, push it to matrix.
                    if (fn_array.length && fn_array[fn_array.length-1].value !== undefined) {
                        if (context[','] === undefined) {
                            error("that shouldn't happen; , is not defined");
                            return { final_j: j, fn: function (stmts, stck) {}, error: "bad matrix pop" };
                        }
                        fn_array.push(context[',']);
                    }
                }
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

function decodeHTML(html) {
    var txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

function parse(text) {
    reset_statements();
    var fn = compile_function(root, decodeHTML(text), 0, null);
    if (fn.error !== undefined) {
        error("couldn't parse text "+ text);
        return fn;
    }
    return fn;
}
