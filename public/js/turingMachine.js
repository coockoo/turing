function TuringMachine () {
    this.tape = ['_'];
    this.index = 0;
    this.currentState = null;
    this.table = [];
    this.name = "";
    this.alphabet = [];
}
TuringMachine.prototype.freeID = 0;
TuringMachine.prototype.setName = function (name) {
    this.name = name;
};

// -- {id, state, cell, replace, move, next}
TuringMachine.prototype.addRule = function (rule, callback) {
    rule.id = this.freeID++;
    this.table.push(rule);
    callback && "function" == typeof callback && callback(rule);
    return this;
};
TuringMachine.prototype.deleteRule = function (id) {
    for (var i = 0; i < this.table.length; ++i) {
        if (this.table[i].id == id) {
            this.table.splice(i, 1);
            return this;
        }
    }
    return this;
};
TuringMachine.prototype.resetRules = function () {
    this.table = [];
    this.currentState = null;
};
TuringMachine.prototype.setTape = function (tape) {
    this.tape = tape.slice(0);
    this.index = 0;
    return this;
};
TuringMachine.prototype.setAlphabet = function (alphabet) {
    this.alphabet = alphabet.slice(0);
};
TuringMachine.prototype.setIndex = function (index) {
    if (!(this.index < 0 || this.index >= this.tape.length)) {
        this.index = index;
    }
};
TuringMachine.prototype.resetTape = function () {
    this.tape = ['_'];
    this.index = 0;
};
TuringMachine.prototype.getRule = function (id) {
    for (var i = 0; i < this.table.length; ++i) {
        if (this.table[i].id == id) {
            return this.table[i];
        }
    }
    return null;
};
TuringMachine.prototype.getTape = function () {
    return this.tape.join('');
};
TuringMachine.prototype.getTapeIndex = function () {
    return this.index;

};
TuringMachine.prototype.start = function () {

};
TuringMachine.prototype.step = function (callback) {
    if (this.table.length <= 0) {
        callback('No rules', this.currentState);
        return;
    }
    this.currentState = this.currentState == null?this.table[0].state:this.currentState;
    var currentState = [];
    for (var i = 0; i < this.table.length; ++i) {
        if (this.table[i].state == this.currentState && this.table[i].cell == this.tape[this.index]) {
            currentState.push(this.table[i]);
        }
    }
    if (currentState.length == 0) {
        callback && callback("No rule for state " + this.currentState + " and cell " + this.tape[this.index], this.currentState);
        return;
    }
    if (currentState.length > 1) {
        callback && callback("Multiple choices of state " + currentState[0].state + " and cell " + currentState[0].cell, this.currentState);
    } else {
        if (this.alphabet.indexOf(currentState[0].cell) == -1) {
            callback && callback("Cell " + currentState[0].cell + " is not in alphabet.")
        } else if (this.alphabet.indexOf(currentState[0].replace) == -1) {
            callback && callback("Next cell state " + currentState[0].replace + " is not in alphabet.")
        } else {
            this.replace(currentState[0].replace);
            this.move(currentState[0].move);
            this.currentState = currentState[0].next;
            callback && callback(null, this.currentState);
        }
    }

};
TuringMachine.prototype.replace = function (symbol) {
    this.tape[this.index] = symbol;
    return this;
};
TuringMachine.prototype.move = function (direction) {
    if (direction == 'right') {
        this.index++;
        if (this.tape.length >= this.index) {
            this.tape.push('_');
        }
    } else {
        this.index--;
        if (this.index < 0) {
            this.tape.unshift('_');
            this.index = 0;
        }
    }
    return this;

};
TuringMachine.prototype.getState = function () {
    this.currentState = this.currentState == null?this.table[0].state:this.currentState;
    return this.currentState;
};
TuringMachine.prototype.setState = function (state) {
    this.currentState = state;
};
// -- Server part

//TODO: move config to separate file/class
TuringMachine.prototype.save = function (callback) {
    $.ajax({
            type: "post",
            url: config.backendURL + '/save',
            data: JSON.stringify({rules: this.table, name: this.name, alphabet: this.alphabet}),
            dataType: "json",
            contentType: "application/json",
            success: function (data) {
                callback && callback(data);
            }
        }
    );
};
TuringMachine.prototype.loadAll = function (callback) {
    $.ajax({
            type: "get",
            url: config.backendURL + '/load-all',
            dataType: "json",
            contentType: "application/json",
            success: function (data) {
                callback && callback(data);
            }
        }
    );
};
TuringMachine.prototype.load = function (id, callback) {
    $.ajax({
            type: "get",
            url: config.backendURL + '/load/:id'.replace(':id', id),
            dataType: "json",
            contentType: "application/json",
            success: function (data) {
                this.currentState = null;
                callback && callback(data);
            }.bind(this)
        }
    );
};
TuringMachine.prototype.removeLoad = function (id, callback) {
    $.ajax({
            type: "get",
            url: config.backendURL + '/remove/:id'.replace(':id', id),
            contentType: "application/json",
            success: function (data) {
                callback && callback(data);
            }
        }
    );
};
TuringMachine.prototype.download = function (id, callback) {
    $.ajax({
            type: "get",
            url: config.backendURL + '/download/:id'.replace(':id', id),
            success: function (data) {
                callback && callback(data);
            }
        }
    );
};
