var body = document.getElementById("body");
var topDiv = document.getElementById("topDiv");
var aShift = document.getElementById("aShift");
var codeDiv = document.getElementById("codeDiv");
var errorMsg = document.getElementById("errorMsg");

var expires = new Date();
expires.setTime(expires.getTime() + 365*(24*60*60*1000));
expires = "; expires="+expires.toUTCString();

var fontSize;
var shiftExecutes;
if (document.cookie) {
    var cookie = {};
    var split = document.cookie.split(";");
    for (var i=0; i<split.length; ++i) {
        var namevalue = split[i].split("=");
        cookie[namevalue[0].trim()] = namevalue[1].trim();
    }
    if (cookie.shiftExecutes) {
        changeShiftExecutes(parseInt(cookie.shiftExecutes));
    } else {
        changeShiftExecutes(0);
    }
    if (cookie.fontSize) {
        changeFontsize(parseInt(cookie.fontSize));
    } else {
        changeFontsize(12);
    }
} else {
    changeShiftExecutes(0);
    changeFontsize(12);
}
var changeFontsizeTimeout;
function changeFontsize(x) {
    if (x < 5) {
        if (fontSize === 5)
            return;
        fontSize = 5;
    } else
        fontSize = x;
    body.style.fontSize = fontSize+"px";
    topDiv.style.lineHeight = 10+1.2*fontSize+"px";
    body.style.paddingTop = topDiv.offsetHeight;
    // write a cookie after 5 seconds
    clearTimeout(changeFontsizeTimeout);
    changeFontsizeTimeout = setTimeout(writeFontsizeCookie, 5000);
};
function writeFontsizeCookie() {
    document.cookie = "fontSize="+fontSize+expires;
}
var changeShiftExecutesTimeout;
function changeShiftExecutes(x, nowrite) {
    if (x === 1) {
        aShift.innerHTML = "Shift+Enter";
        shiftExecutes = 1;
    } else { //if (x === 0) { // make default!
        aShift.innerHTML = "Enter";
        shiftExecutes = 0;
    }
    body.style.paddingTop = topDiv.offsetHeight;
    // write a cookie after 5 seconds
    clearTimeout(changeShiftExecutesTimeout);
    changeShiftExecutesTimeout = setTimeout(writeShiftExecutesCookie, 5000);
}
function writeShiftExecutesCookie() {
    document.cookie = "shiftExecutes="+shiftExecutes+expires;
}

addEmptyCodeLine();
function addEmptyCodeLine(focus) {
    var newcode = document.createElement("pre");
    newcode.className = "code";
    newcode.contentEditable = "true";
    codeDiv.appendChild(newcode);
    if (focus === undefined)
        newcode.focus();
};

function execute(codeblock) {
    // clear out error messages from previous rounds
    while (codeblock.nextSibling) codeblock.parentElement.removeChild(codeblock.nextSibling);

    // then parse
    var result = parse(codeblock.innerHTML);
    if (result.error !== undefined)
        return;
 
    // now execute:
    result.fn(statements, stack);

    codeblock.contentEditable = "false"; 
    codeblock.blur();
    addResponseLine(print_stack(stack), "result");
    addEmptyCodeLine();
}

function addResponseLine(s, s_class) {
    var newline = document.createElement("pre");
    newline.className = s_class;
    newline.innerHTML = s;
    codeDiv.appendChild(newline);
};

function insertText(code, text) {
    // WARNING:  code should probably be document.activeElement 
    var range, selection;
    selection = window.getSelection();
    if (selection.getRangeAt && selection.rangeCount) {
        range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode( document.createTextNode(text) );
    } else {
        console.error("this probably should never trigger");
        code.innerHTML += text;
        range = document.createRange();
        range.selectNodeContents(code);
    }
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
}

function terminal_onkeydown(evt) {
    var code = document.activeElement;
    if (code.getAttribute("class") !== "code")
        return;
    if (evt.keyCode === 13) {
        // if we press enter on a code snippet...
        evt.preventDefault();
        if (evt.shiftKey == shiftExecutes) {
            execute(code);
        } else {
            insertText(code, "\r\n"); // for windows
        }
        return false;
    } else if (evt.keyCode === 9) { // tab
        evt.preventDefault();
        insertText(code, "  "); // or maybe \t ?  make an option...
        return false;
    }
}

