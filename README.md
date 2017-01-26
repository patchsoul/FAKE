# FAKE
home of the FAKE programming language

inspired mostly by MATL.

interactive shell: https://patchsoul.github.io/FAKE

## Tutorial

try out the hello world example.

    "hello world!"

the language uses postfix operators to operate on the stack, where you can push numbers, strings,
and other things:

    5 4 /   # = 1.25

the hashtag `#` creates a comment to the end of the line.

the top element on the stack is called TOS (top of stack), and the next on stack is called NOS.
when printing the stack, the letter `e` indicates where the current TOS is (internally, stack index).
normally it's at the very end of the stack, but you can lower/raise the stack index with parentheses `()`.

numbers are any digit (0-9) or a minus sign followed by any digit, with one period optional to
indicate the decimal place.  no scientific notation allowed.

    2.432 0.5* # = 1.216

almost every character has some significance, and you don't always have to put space in between them.
elements on the stack can become arguments to functions, but there are function instructions
or branches which can be passed in on the right of certain functions.

    0!["not branch"23]["yes branch"1000]

`!` is the NOT conditional branch.  it pops the TOS and executes one of the instructions 
to the right of it.  if you want to keep the TOS intact, use `?` before `!`, since `?` pushes to
the stack the logical value of the TOS.  also, you don't need brackets `[]` if your statement is
only one instruction long.

    3y-?!p"yes branch"

here `y` copies (shallow copies) the TOS, and `p` pops the TOS.

oh, and there's loops, too.  `l` starts a loop, takes one instruction (on the right),
`j` jumps back to the start of the loop, and `k` breaKs out of a loop (or Kicks you out):

    10l[?!k"hello `y`!"1-j]

it's supposed to be easy to remember because ljk are next to each other in the alphabet.
without the `j`, the loop would not be repeated.  if you noticed, in strings (quotes ' or "),
you can execute arbitrary code using backticks \`; this executes a function and then pops
the stack to print something in the middle of the string.  useful for debugging and probably
other text-writing type stuff.

not yet implemented:
multi-character functions must be enclosed in backticks \`.

## Language

things that are currently implemented:
```
    '' "" `` \ #
    +-/*
    ?! ~
    pdyY
    [] () {} e
    ljk
    n
```

Things may change, but these are the current ideas/definitions of things:

    used letters
        abcde jkl n p r xyz
        F M R T Y
    unused letters
        fghi m o q stuvw
        ABCDE GHIJKL NOPQ S UVWX Z

    ""  # write string to output
        # e.g.
        #   "hello world!"
    ''  # push string to stack
        # e.g.
        #   'this string is now on the stack'
    ``  # execute string function enclosed.
        # e.g.
        #   'function'z["defining a function"]
        #   `function`  # executes the function

    e   # identity function, executes next instruction.  

    n   # push number of elements on the stack
    r   # return

    abc # function definitions
    z   # zero-instruction function definition
    
    ?   # push logical value of TOS to stack, DO NOT pop TOS
    !   # not conditional, pop TOS, two instructions to branch
    |   # or - push logical value of TOS or NOS to stack, pop both
    &   # and - "   "       "     "   "  AND "  "   ", pop both
    x   # repeat next instruction based on TOS (pop that)

    #   # comment.  VERY SPECIAL character, cannot be overwritten in other contexts.

    $   # not a dict.  VERY SPECIAL character.  checks out the next number to determine
    $0-9# how many function instructions the TOS needs to execute.  error if TOS is not a function with that many instructions.
        # the number MUST BE seen at compile time, and anything besides 0-9, the default $0 will be assumed.

    d   # duplicate
    y   # shallow copy
    Y   # shallow copy NOS and TOS
    []  # statement, empty statement equals a tab.
    ()  # move stack index, or TODO execute if nothing in between.
        # parentheses should match before any j or k could get hit, 
        # since there's (currently) no way to check where the stack index is.
    {}  # push null if nothing in between.  
        # otherwise create a new stack, insulated from other stack.  
        # can't access original stack from inside the brackets.
        #   {5} # push a stack with 5 on it, to the stack.
        # this is a way to create a resizable array of objects.
        # you can push objects to the stack after creating it using the S object:
        #   {}42Sa  # push 42 to a new (null) stack; it won't be null after that.

    S   # super awesome one-instruction function to deal with a stack on the TOS.  (doesn't pop it, ever.  use p for that.)
    Sp  # stack pop.  pop last element of array-stack on TOS and push it to the current stack.  keep original TOS.
    SP  # stack append.  NOS is stack, TOS is what to append to that stack.  pop TOS.
    Si  # stack insert.  NOS is stack, TOS is what to prepend to that stack (insert at position 0).  pop TOS.
    Se  # stack execute.  execute the next instruction by descending into the stack on the TOS.  keep TOS.
        # you can push more values to the stack in this way:
        #   {}Se[5 4 3 2 1] # push 5 4 3 2 1 to the originally null stack.  equivalent to {5 4 3 2 1}
        # you can also isolate a function by performing the following:
        #   {}Se['start of new stack '5d6d `function`]  # equivalent to {'start of new stack '5d6d`function`}
    Sn  # number of elements on the stack on the TOS.  (don't pop)

    *   # multiply
    /   # divide
    +   # plus
    -   # minus, unary if preceding a valid number, binary otherwise

    ^   # power
    _   # log, base e
    ~   # swap

    \   # go back in scope/context

    ,   # write (and pop) TOS to output (if matrix is open for writing, or if write file is open, or stdout otherwise), without newline
    ;   # write (and pop) TOS to output, with newline
    .   # write (and pop) TOS to stdout, if not in front of a number (0-9) or after a number
    :   # write (and pop) TOS to stdERR

    F   # dict-like object for impressive file operations
    F,  # fetch character from input (read file, or from stdin if read file not open)
    F;  # fetch to newline from input
    F.  # fetch to end of statement from input
    F:  # fetch all of file, push it as string array to stack

    Fi  # fetch an integer, push null if none found
    Fl  # fetch a long integer or push null
    Ff  # fetch a float
    Fd  # fetch a double
    Fc  # fetch complex
    Fg  # fetch double complex

    Fr  # read - use TOS to name a file, open it for reading only within the next instruction, use j to jump back to the beginning of this statement.
    Fw  # write
    FI  # import executable FAKE program into its own context, fundamentally something you can't do with a read and execute, since contexts are all defined by root.
        #   'A'aa           # create the context beforehand
        #   'a.fake'AFI     # load file 'a.fake' into context 'A'.  error if any functions in 'A' are already defined with a different number of function instructions. 
        # you can import into the root context using 
        #   'b.fake'FI 

    F|  # write file (name at TOS) to output, no replacements, pop filename
    F=  # write file (name at TOS) to output, WITH replacements (back-quoted strings are executed), pop filename

    M   # dict-like object/context for impressive math functions
    Me  # math constant e
    Mp  # math constant pi
    M~  # matrix conjugate transpose
    Ma  # allocate matrix using NOS and TOS (pop them) for rows and columns
    Mw  # allocate matrix using NOS and TOS (pop them) and write to it with next instruction (can be looped with j)
    Mv  # get matrix value at NOS row and TOS column (pop both)
    Mr  # get pointer to matrix row using TOS (pop it)
    M*  # element-by-element multiplication (not row*column type of thing)
    M/  # element-by-element divide
    M^  # element-by-element power
    M+  # pseudo-inverse
    Mt  # trace
    Md  # determinant
    MD  # diagonalize
    MS  # svd
    MF  # fourier transform?

    B~  # bitwise NOT (one-operand)
    B!  # bitwise XOR (two-operands)
    B|  # bitwise OR
    B&  # bitwise and
    B<  # bitshift left
    B>  # bitshift right
   
    R   # dict-like object for a random number
    Rn  # random number (probably a float, from 0 to 1, not including 1)
    Ri  # random integer
    Rl  # random long integer
    Rf  # random float (from 0 to 1, not including 1)
    Rd  # random double (from 0 to 1, not including 1)
    Rc  # random complex (in the unit circle)
    Rg  # random double complex (in the unit circle)
    Rm  # random matrix (takes NOS/TOS for rows/columns)
    Rp  # random permutation (takes TOS for how many elements)
