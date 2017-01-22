var History = {index: -1, array: [], just_added: false};

function check_history_and_change(text, dir) {
    if (History.array.length === 0) {
        if (!text)
            return "";
        if (dir < 0)
            // go back in time, but nothing is there, keep what you have:
            return text;
        // going forward in time, to the future nothing, but keep track of what we had.
        allocate(History);
        History.array[History.index++] = text;
        return "";
    } else if (dir < 0) { // going back
        History.just_added = false;
        if (History.index === 0)
            return History.array[0]; // nothing previous to this
        // do we already have text in the history?
        if (!text) 
            return History.array[--History.index];
       
        if (--History.index === History.array.length-1) {
            // was at end of the array...
            if (History.array[History.index] == text) {
                if (History.index == 0)
                    return History.array[0]; 
                else
                    return History.array[--History.index]; 
            }
            allocate(History);
            History.array[History.index] = text;
            return History.array[--History.index];
        } else if (text == History.array[History.index+1])
            return History.array[History.index];
        else if (text == History.array[History.index]) {
            if (History.index === 0)
                return text;
            return History.array[--History.index];
        }
        allocate(History);
        History.array[History.index] = text;
        return History.array[--History.index];
    }
    // else going forward:
    if (History.just_added) {
        History.just_added = false;
        --History.index;
    }
    if (!text) {
        if (++History.index >= History.array.length) {
            History.index = History.array.length;
            return "";
        }
        return History.array[History.index];
    }
    if (History.index >= History.array.length - 1) {
        if (History.array[History.array.length-1] == text) {
            History.index = History.array.length;
            return "";
        }
        History.array[History.array.length] = text;
        History.index = History.array.length;
        return "";
    }
    // somewhere in the middle 
    // do we already have text in the history?
    if (text == History.array[History.index])
        return History.array[++History.index];
    else if (text == History.array[++History.index]) {
        return History.array[++History.index];
    }
    --History.index;
    allocate(History);
    History.array[History.index] = text;
    return History.array[++History.index];
}

function add_history(text) {
    if (!text)
        return;
    if (History.array.length) {
        if (History.index === History.array.length) {
            if (History.array[History.index-1] != text) {
                History.array[History.index++] = text;
                History.just_added = true;
            }
            return;
        }
        if (History.array[History.index] == text || (History.index > 0 && History.array[History.index-1] == text))
            return;
    }
    allocate(History);
    History.array[History.index++] = text;
    History.just_added = true;
}
