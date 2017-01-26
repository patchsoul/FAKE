var divide = [
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

function matrix_multiply(new_matrix, A, B) {
    if (A.columns != B.rows)
        return error("column/row mismatch for multiplying matrices");
    new_matrix.rows = A.rows;
    new_matrix.array = Array(A.rows);
    new_matrix.columns = B.columns;
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
    return 0;
}

var multiply = [
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
        var new_matrix = {};
        matrix_multiply(new_matrix, stck.array[stck.index-1], stck.array[stck.index]);
        pop(stck);
        pop(stck);
        allocate(stck);
        stck.array[stck.index] = new_matrix;
        return 0;
    }
];

var subtract = [
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

var add = [
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

function logical_value(e) {
    switch (typeof e) {
        case 'number':
            if (e === 0)
                return 0;
            else
                return 1;
        break;
        case 'string':
            if (e === '')
                return 0;
            else
                return 1;
        break;
        case 'object':
            if (e.index !== undefined) { // stack
                if (e.array.length === 0)
                    return 0;
                else
                    return 1;
            } else {
                // matrix
                if (e.rows*e.columns === 0)
                    return 0;
                else
                    return 1;
            }
        break;
        default:
            error("somehow "+e+" is not a valid float, string, stack, or matrix in single argument");
            return -1;
    }
}

function logical_branch(fn) { // creates a function that looks at logical value of TOS.  does not pop it.
    return function (stmts, stck) {
        if (stck.index < 0)
            return error("not enough on stack for logical branch");
        var result = logical_value(stck.array[stck.index]);
        if (result < 0)
            return error("cannot get logical value of TOS");
        return fn(stmts, stck, result);
    };
}

var power = [
    // float float
    function (stmts, stck) { 
        stck.array[stck.index-1] = Math.pow(stck.array[stck.index-1], stck.array[stck.index]);
        pop(stck);
        return 0;
    },
    // string float
    function (stmts, stck) { 
        return error("can't power string at NOS by float at TOS...");
    },
    // stack float
    function (stmts, stck) { 
        return error("can't power stack at NOS by float at TOS, it's isolated...");
    },
    // matrix float
    function (stmts, stck) {
        // TODO.  for square matrix, can diagonalize:
        // A = S^* D S, where S^* S = 1
        // A^p = (S^* D S)^p = S^* D^p S
        // you can take element-wise powers for D^p.
        return error("can't power matrix at NOS by float at TOS, not yet...");
    },
    // float string
    function (stmts, stck) { 
        return error("can't power float at NOS by string at TOS");
    },
    // string string
    function (stmts, stck) { 
        return error("can't power two strings");
    },
    // stack string
    function (stmts, stck) { 
        return error("can't power stack at NOS by string at TOS, it's isolated...");
    },
    // matrix string
    function (stmts, stck) {
        return error("can't power matrix at NOS by string at TOS.  what would that mean?");
    },
    // float stack
    function (stmts, stck) { 
        return error("can't power float at NOS by stack at TOS.  what would that mean?");
    },
    // string stack
    function (stmts, stck) { 
        return error("can't power float at NOS by stack at TOS.  what would that mean?");
    },
    // stack stack
    function (stmts, stck) { 
        return error("can't power two stacks.  what would that mean?");
    },
    // matrix stack
    function (stmts, stck) {
        return error("can't power matrix at NOS by stack at TOS.  what would that mean?");
    },
    // float matrix
    function (stmts, stck) { 
        return error("can't power float at NOS by matrix at TOS.  not always converging.");
    },
    // string matrix
    function (stmts, stck) { 
        return error("can't power string at NOS by matrix at TOS.");
    },
    // stack matrix
    function (stmts, stck) { 
        return error("can't power stack at NOS by matrix at TOS.  stack is isolated...");
    },
    // matrix matrix
    function (stmts, stck) {
        // though go for it:  
        // http://math.stackexchange.com/questions/164422/matrix-raised-to-a-matrix
        return error("can't power two matrices...");
    }
];

var log_e = [
    // float
    function (stmts, stck) { 
        stck.array[stck.index] = Math.log(stck.array[stck.index]);
        return 0;
    },
    // string
    function (stmts, stck) { 
        return error("can't log string at TOS.  what would that mean?");
    },
    // stack
    function (stmts, stck) { 
        return error("can't log stack at TOS, it's isolated...");
    },
    // matrix
    function (stmts, stck) {
        // technically can take log of a matrix...  but it might not converge...
        return error("can't log matrix at TOS, may not converge...");
    }
];

var less_than = [
    // float float
    function (stmts, stck) { 
        var result = stck.array[stck.index-1] < stck.array[stck.index] ? 1 : 0;
        pop(stck);
        pop(stck);
        allocate(stck);
        stck.array[stck.index] = result;
        return 0;
    },
    // string float
    function (stmts, stck) { 
        return error("can't compare string at NOS by float at TOS...");
    },
    // stack float
    function (stmts, stck) { 
        return error("can't compare stack at NOS by float at TOS, it's isolated...");
    },
    // matrix float
    function (stmts, stck) {
        // get matrix determinant, compare to float
        return error("can't compare matrix at NOS by float at TOS, not yet...");
    },
    // float string
    function (stmts, stck) { 
        return error("can't compare float at NOS by string at TOS");
    },
    // string string
    function (stmts, stck) { 
        var result = stck.array[stck.index-1].localeCompare(stck.array[stck.index]) < 0 ? 1 : 0;
        pop(stck);
        pop(stck);
        allocate(stck);
        stck.array[stck.index] = result; 
        return 0;
    },
    // stack string
    function (stmts, stck) { 
        return error("can't compare stack at NOS by string at TOS, it's isolated...");
    },
    // matrix string
    function (stmts, stck) {
        return error("can't compare matrix at NOS by string at TOS.  what would that mean?");
    },
    // float stack
    function (stmts, stck) { 
        return error("can't compare float at NOS by stack at TOS.  what would that mean?");
    },
    // string stack
    function (stmts, stck) { 
        return error("can't compare float at NOS by stack at TOS.  what would that mean?");
    },
    // stack stack
    function (stmts, stck) { 
        return error("can't compare two stacks.  what would that mean?");
    },
    // matrix stack
    function (stmts, stck) {
        return error("can't compare matrix at NOS by stack at TOS.  what would that mean?");
    },
    // float matrix
    function (stmts, stck) { 
        return error("can't compare float at NOS by matrix at TOS.  not yet...");
    },
    // string matrix
    function (stmts, stck) { 
        return error("can't compare string at NOS by matrix at TOS.");
    },
    // stack matrix
    function (stmts, stck) { 
        return error("can't compare stack at NOS by matrix at TOS.  stack is isolated...");
    },
    // matrix matrix
    function (stmts, stck) {
        return error("can't compare two matrices..., not yet...");
    }
];

var greater_than = [
    // float float
    function (stmts, stck) { 
        var result = stck.array[stck.index-1] > stck.array[stck.index] ? 1 : 0;
        pop(stck);
        pop(stck);
        allocate(stck);
        stck.array[stck.index] = result;
        return 0;
    },
    // string float
    function (stmts, stck) { 
        return error("can't compare string at NOS by float at TOS...");
    },
    // stack float
    function (stmts, stck) { 
        return error("can't compare stack at NOS by float at TOS, it's isolated...");
    },
    // matrix float
    function (stmts, stck) {
        // get matrix determinant, compare to float
        return error("can't compare matrix at NOS by float at TOS, not yet...");
    },
    // float string
    function (stmts, stck) { 
        return error("can't compare float at NOS by string at TOS");
    },
    // string string
    function (stmts, stck) { 
        var result = stck.array[stck.index-1].localeCompare(stck.array[stck.index]) > 0 ? 1 : 0;
        pop(stck);
        pop(stck);
        allocate(stck);
        stck.array[stck.index] = result; 
        return 0;
    },
    // stack string
    function (stmts, stck) { 
        return error("can't compare stack at NOS by string at TOS, it's isolated...");
    },
    // matrix string
    function (stmts, stck) {
        return error("can't compare matrix at NOS by string at TOS.  what would that mean?");
    },
    // float stack
    function (stmts, stck) { 
        return error("can't compare float at NOS by stack at TOS.  what would that mean?");
    },
    // string stack
    function (stmts, stck) { 
        return error("can't compare float at NOS by stack at TOS.  what would that mean?");
    },
    // stack stack
    function (stmts, stck) { 
        return error("can't compare two stacks.  what would that mean?");
    },
    // matrix stack
    function (stmts, stck) {
        return error("can't compare matrix at NOS by stack at TOS.  what would that mean?");
    },
    // float matrix
    function (stmts, stck) { 
        return error("can't compare float at NOS by matrix at TOS.  not yet...");
    },
    // string matrix
    function (stmts, stck) { 
        return error("can't compare string at NOS by matrix at TOS.");
    },
    // stack matrix
    function (stmts, stck) { 
        return error("can't compare stack at NOS by matrix at TOS.  stack is isolated...");
    },
    // matrix matrix
    function (stmts, stck) {
        return error("can't compare two matrices..., not yet...");
    }
];

var equal = [
    // float float
    function (stmts, stck) { 
        var result = stck.array[stck.index-1] === stck.array[stck.index] ? 1 : 0;
        pop(stck);
        pop(stck);
        allocate(stck);
        stck.array[stck.index] = result;
        return 0;
    },
    // string float
    function (stmts, stck) { 
        return error("can't compare string at NOS by float at TOS...");
    },
    // stack float
    function (stmts, stck) { 
        return error("can't compare stack at NOS by float at TOS, it's isolated...");
    },
    // matrix float
    function (stmts, stck) {
        // get matrix determinant, compare to float
        return error("can't compare matrix at NOS by float at TOS, not yet...");
    },
    // float string
    function (stmts, stck) { 
        return error("can't compare float at NOS by string at TOS");
    },
    // string string
    function (stmts, stck) { 
        var result = stck.array[stck.index-1].localeCompare(stck.array[stck.index]) === 0 ? 1 : 0;
        pop(stck);
        pop(stck);
        allocate(stck);
        stck.array[stck.index] = result; 
        return 0;
    },
    // stack string
    function (stmts, stck) { 
        return error("can't compare stack at NOS by string at TOS, it's isolated...");
    },
    // matrix string
    function (stmts, stck) {
        return error("can't compare matrix at NOS by string at TOS.  what would that mean?");
    },
    // float stack
    function (stmts, stck) { 
        return error("can't compare float at NOS by stack at TOS.  what would that mean?");
    },
    // string stack
    function (stmts, stck) { 
        return error("can't compare float at NOS by stack at TOS.  what would that mean?");
    },
    // stack stack
    function (stmts, stck) { 
        return error("can't compare two stacks.  what would that mean?");
    },
    // matrix stack
    function (stmts, stck) {
        return error("can't compare matrix at NOS by stack at TOS.  what would that mean?");
    },
    // float matrix
    function (stmts, stck) { 
        return error("can't compare float at NOS by matrix at TOS.  not yet...");
    },
    // string matrix
    function (stmts, stck) { 
        return error("can't compare string at NOS by matrix at TOS.");
    },
    // stack matrix
    function (stmts, stck) { 
        return error("can't compare stack at NOS by matrix at TOS.  stack is isolated...");
    },
    // matrix matrix
    function (stmts, stck) {
        // compare item by item.
        var A = stck.array[stck.index-1];
        var B = stck.array[stck.index];
        if (A.rows !== B.rows || A.columns != B.columns) {
            pop(stck);
            pop(stck);
            allocate(stck);
            stck.array[stack.index] = 0;
        }
        for (var i=0; i<A.rows; ++i)
        for (var j=0; j<A.columns; ++j) {
            if (A.array[i][j] !== B.array[i][j]) {
                pop(stck);
                pop(stck);
                allocate(stck);
                stck.array[stack.index] = 0;
                return 0;
            }
        }
        pop(stck);
        pop(stck);
        allocate(stck);
        stck.array[stack.index] = 1;
        return 0;
    }
];
