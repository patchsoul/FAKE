divide = [
    // float float
    function (stmts, stck) { 
        stck.array[stck.index-1] /= stck.array[stck.index];
        pop(stck);
        return 0;
    },
    // string float
    function (stmts, stck) { 
        return error("can't divide string at NOS by float at TOS.  what would that mean?");
    },
    // stack float
    function (stmts, stck) { 
        return error("can't divide stack at NOS by float at TOS, it's isolated...");
    },
    // matrix float
    function (stmts, stck) {
        for (var i=0; i<stck.array[stck.index-1].rows; ++i)
        for (var j=0; j<stck.array[stck.index-1].columns; ++j)
            stck.array[stck.index-1].array[i][j] /= stck.array[stck.index];
        pop(stck);
        return 0;
    },
    // float string
    function (stmts, stck) { 
        return error("can't divide float at NOS by string at TOS.  what would that mean?");
    },
    // string string
    function (stmts, stck) { 
        return error("can't divide two strings.  what would that mean?");
    },
    // stack string
    function (stmts, stck) { 
        return error("can't divide stack at NOS by string at TOS, it's isolated...");
    },
    // matrix string
    function (stmts, stck) {
        return error("can't divide matrix at NOS by string at TOS.  what would that mean?");
    },
    // float stack
    function (stmts, stck) { 
        return error("can't divide float at NOS by stack at TOS.  what would that mean?");
    },
    // string stack
    function (stmts, stck) { 
        return error("can't divide string at NOS by stack at TOS.  what would that mean?");
    },
    // stack stack
    function (stmts, stck) { 
        return error("can't divide two stacks.  what would that mean?");
    },
    // matrix stack
    function (stmts, stck) {
        return error("can't divide matrix at NOS by stack at TOS.  what would that mean?");
    },
    // float matrix
    function (stmts, stck) { 
        return error("can't divide float at NOS by matrix at TOS.  don't have javascript implementation for matrix inverse.");
    },
    // string matrix
    function (stmts, stck) { 
        return error("can't divide string at NOS by matrix at TOS.  what would that mean?");
    },
    // stack matrix
    function (stmts, stck) { 
        return error("can't divide stack at NOS by matrix at TOS.  stack is isolated...");
    },
    // matrix matrix
    function (stmts, stck) {
        return error("can't divide two matrices.  don't have javascript implementation for matrix inverse.");
    }
];

multiply = [
    // float float
    function (stmts, stck) { 
        stck.array[stck.index-1] *= stck.array[stck.index];
        pop(stck);
        return 0;
    },
    // string float
    function (stmts, stck) { 
        stck.array[stck.index-1] = Array(stck.array[stck.index]+1).join(stck.array[stck.index-1]);
        pop(stck);
        return 0;
    },
    // stack float
    function (stmts, stck) { 
        return error("can't multiply stack at NOS by float at TOS, it's isolated...");
    },
    // matrix float
    function (stmts, stck) {
        for (var i=0; i<stck.array[stck.index-1].rows; ++i)
        for (var j=0; j<stck.array[stck.index-1].columns; ++j)
            stck.array[stck.index-1].array[i][j] *= stck.array[stck.index];
        pop(stck);
        return 0;
    },
    // float string
    function (stmts, stck) { 
        stck.array[stck.index-1] = Array(stck.array[stck.index-1]+1).join(stck.array[stck.index]);
        pop(stck);
        return 0;
    },
    // string string
    function (stmts, stck) { 
        return error("can't multiply two strings.  what would that mean?");
    },
    // stack string
    function (stmts, stck) { 
        return error("can't multiply stack at NOS by string at TOS, it's isolated...");
    },
    // matrix string
    function (stmts, stck) {
        return error("can't multiply matrix at NOS by string at TOS.  what would that mean?");
    },
    // float stack
    function (stmts, stck) { 
        return error("can't multiply float at NOS by stack at TOS.  what would that mean?");
    },
    // string stack
    function (stmts, stck) { 
        return error("can't multiply string at NOS by stack at TOS.  what would that mean?");
    },
    // stack stack
    function (stmts, stck) { 
        return error("can't multiply two stacks.  what would that mean?");
    },
    // matrix stack
    function (stmts, stck) {
        return error("can't multiply matrix at NOS by stack at TOS.  what would that mean?");
    },
    // float matrix
    function (stmts, stck) { 
        for (var i=0; i<stck.array[stck.index].rows; ++i)
        for (var j=0; j<stck.array[stck.index].columns; ++j)
            stck.array[stck.index].array[i][j] *= stck.array[stck.index-1];
        --stck.index;
        pop(stck);
        ++stck.index;
        return 0;
    },
    // string matrix
    function (stmts, stck) { 
        return error("can't multiply string at NOS by matrix at TOS.  what would that mean?");
    },
    // stack matrix
    function (stmts, stck) { 
        return error("can't multiply stack at NOS by matrix at TOS.  stack is isolated...");
    },
    // matrix matrix
    function (stmts, stck) {
        var A = stck.array[stck.index-1], B = stck.array[stck.index];
        if (A.columns != B.rows)
            return error("column/row mismatch for multiplying matrices");
        var new_matrix = {
            rows: A.rows,
            columns: B.columns,
            array: Array(A.rows)
        };
        for (var i=0; i<new_matrix.rows; ++i) {
            new_matrix.array[i] = Array(new_matrix.columns);
            for (var j=0; j<new_matrix.columns; ++j) {
                var result = 0;
                for (var k=0; k<A.columns; ++k) { // or B.rows
                    result += A.array[i][k] * B.array[k][j];
                }
                new_matrix.array[i][j] = result;
            }
        }
        pop(stck);
        pop(stck);
        allocate(stck);
        stck.array[stck.index] = new_matrix;
        return 0;
    }
];

subtract = [
    // float float
    function (stmts, stck) { 
        stck.array[stck.index-1] -= stck.array[stck.index];
        pop(stck);
        return 0;
    },
    // string float
    function (stmts, stck) { 
        return error("can't subtract float from a string");
    },
    // stack float
    function (stmts, stck) { 
        return error("can't subtract stack at NOS by float at TOS, it's isolated...");
    },
    // matrix float
    function (stmts, stck) {
        var smaller = stck.array[stck.index-1].rows <= stck.array[stck.index-1].columns ? 
            stck.array[stck.index-1].rows :
            stck.array[stck.index-1].columns;
        for (var i=0; i<smaller; ++i)
            stck.array[stck.index-1].array[i][i] -= stck.array[stck.index];
        pop(stck);
        return 0;
    },
    // float string
    function (stmts, stck) { 
        return error("can't subtract string from float");
    },
    // string string
    function (stmts, stck) { 
        return error("can't subtract two strings.  what would that mean?");
    },
    // stack string
    function (stmts, stck) { 
        return error("can't subtract stack at NOS by string at TOS, it's isolated...");
    },
    // matrix string
    function (stmts, stck) {
        return error("can't subtract matrix at NOS by string at TOS.  what would that mean?");
    },
    // float stack
    function (stmts, stck) { 
        return error("can't subtract float at NOS by stack at TOS.  what would that mean?");
    },
    // string stack
    function (stmts, stck) { 
        return error("can't subtract string at NOS by stack at TOS.  what would that mean?");
    },
    // stack stack
    function (stmts, stck) { 
        return error("can't subtract two stacks.  what would that mean?");
    },
    // matrix stack
    function (stmts, stck) {
        return error("can't subtract matrix at NOS by stack at TOS.  what would that mean?");
    },
    // float matrix
    function (stmts, stck) { 
        // negate the matrix
        for (var i=0; i<stck.array[stck.index].rows; ++i)
        for (var j=0; j<stck.array[stck.index].columns; ++j)
            stck.array[stck.index].array[i][j] *= -1;
        
        // add in the float to the diagonal
        var smaller = stck.array[stck.index].rows <= stck.array[stck.index].columns ? 
            stck.array[stck.index].rows :
            stck.array[stck.index].columns;
        for (var i=0; i<smaller; ++i)
            stck.array[stck.index].array[i][i] += stck.array[stck.index-1];

        --stck.index;
        pop(stck);
        ++stck.index;
        return 0;
    },
    // string matrix
    function (stmts, stck) { 
        return error("can't subtract string at NOS by matrix at TOS.  what would that mean?");
    },
    // stack matrix
    function (stmts, stck) { 
        return error("can't subtract stack at NOS by matrix at TOS.  stack is isolated...");
    },
    // matrix matrix
    function (stmts, stck) {
        var A = stck.array[stck.index-1], B = stck.array[stck.index];
        if (A.columns !== B.columns || A.rows !== B.rows)
            return error("column/row mismatch for subtracting matrices");
        for (var i=0; i<A.rows; ++i) {
            for (var j=0; j<A.columns; ++j) {
                A.array[i][j] -= B.array[i][j];
            }
        }
        pop(stck);
        return 0;
    }
];

add = [
    // float float
    function (stmts, stck) { 
        stck.array[stck.index-1] += stck.array[stck.index];
        pop(stck);
        return 0;
    },
    // string float
    function (stmts, stck) { 
        stck.array[stck.index-1] += stck.array[stck.index];
        pop(stck);
        return 0;
    },
    // stack float
    function (stmts, stck) { 
        return error("can't add stack at NOS by float at TOS, it's isolated...");
    },
    // matrix float
    function (stmts, stck) {
        var smaller = stck.array[stck.index-1].rows <= stck.array[stck.index-1].columns ? 
            stck.array[stck.index-1].rows :
            stck.array[stck.index-1].columns;
        for (var i=0; i<smaller; ++i)
            stck.array[stck.index-1].array[i][i] += stck.array[stck.index];
        pop(stck);
        return 0;
    },
    // float string
    function (stmts, stck) { 
        return error("can't add string from float");
    },
    // string string
    function (stmts, stck) { 
        stck.array[stck.index-1] += stck.array[stck.index];
        pop(stck);
        return 0;
    },
    // stack string
    function (stmts, stck) { 
        return error("can't add stack at NOS by string at TOS, it's isolated...");
    },
    // matrix string
    function (stmts, stck) {
        return error("can't add matrix at NOS by string at TOS.  what would that mean?");
    },
    // float stack
    function (stmts, stck) { 
        return error("can't add float at NOS by stack at TOS.  what would that mean?");
    },
    // string stack
    function (stmts, stck) { 
        stck.array[stck.index-1] += print_stack(stck.array[stck.index]);
        pop(stck);
        return 0;
    },
    // stack stack
    function (stmts, stck) { 
        // TODO: could move all elements from right stack to left stack
        return error("can't add two stacks.  what would that mean?");
    },
    // matrix stack
    function (stmts, stck) {
        return error("can't add matrix at NOS by stack at TOS.  what would that mean?");
    },
    // float matrix
    function (stmts, stck) { 
        // add in the float to the diagonal
        var smaller = stck.array[stck.index].rows <= stck.array[stck.index].columns ? 
            stck.array[stck.index].rows :
            stck.array[stck.index].columns;
        for (var i=0; i<smaller; ++i)
            stck.array[stck.index].array[i][i] += stck.array[stck.index-1];

        --stck.index;
        pop(stck);
        ++stck.index;
        return 0;
    },
    // string matrix
    function (stmts, stck) { 
        stck.array[stck.index-1] += print_matrix(stck.array[stck.index]);
        pop(stck);
        return 0;
    },
    // stack matrix
    function (stmts, stck) { 
        return error("can't add stack at NOS by matrix at TOS.  stack is isolated...");
    },
    // matrix matrix
    function (stmts, stck) {
        var A = stck.array[stck.index-1], B = stck.array[stck.index];
        if (A.columns !== B.columns || A.rows !== B.rows)
            return error("column/row mismatch for adding matrices");
        for (var i=0; i<A.rows; ++i) {
            for (var j=0; j<A.columns; ++j) {
                A.array[i][j] += B.array[i][j];
            }
        }
        pop(stck);
        return 0;
    }
];

function logical_branch(fn) { // creates a function that looks at logical value of TOS.  does not pop it.
    return function (stmts, stck) {
        if (stck.index < 0)
            return error("not enough on stack for logical branch");
        var result;
        switch (typeof stck.array[stck.index]) {
            case 'number':
                if (stck.array[stck.index] === 0)
                    result = 0;
                else
                    result = 1;
            break;
            case 'string':
                if (stck.array[stck.index] === '')
                    result = 0;
                else
                    result = 1;
            break;
            case 'object':
                if (stck.array[stck.index].index !== undefined) { // stack
                    if (stck.array[stck.index].array.length === 0)
                        result = 0;
                    else
                        result = 1;
                } else {
                    // matrix
                    if (stck.array[stck.index].rows*stck.array[stck.index].columns === 0)
                        result = 0;
                    else
                        result = 1;
                }
            break;
            default:
                return error("somehow "+stck.array[stck.index]+" is not a valid float, string, stack, or matrix in single argument");
        }
        return fn(stmts, stck, result);
    };
}