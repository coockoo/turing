function main () {
    var turingMachine = new TuringMachine();
    var turingMachineUI = new TuringMachineUI(turingMachine);
    turingMachineUI.load(function (turing) {
        //TEST
// -- {id, state, cell, replace, move, next}
        /*
        turing.addRule({state: 1, cell: '_', replace: 'D', move: 'right', next: 1});
        turing.addRule({state: 1, cell: 'A', replace: 'D', move: 'right', next: 2});
        turing.addRule({state: 2, cell: '_', replace: 'A', move: 'right', next: 3});
        turing.addRule({state: 2, cell: 'H', replace: 'A', move: 'right', next: 3});
        turing.addRule({state: 3, cell: '_', replace: 'S', move: 'right', next: 4});
        */
    });

}