const readline = require("readline");
const fs = require("fs");

// State class
class State {
    constructor(state) {
        this.state = state;
    }

    toString() {
        return this.state;
    }
}

const authorized = new State("authorized");
const unauthorized = new State("unauthorized");

// Transition table
const transitionTable = {
    [authorized]: [
        ["login", (param, pwd, curBal) => [false, curBal, null], authorized],
        ["logout", (param, pwd, curBal) => [true, curBal, null], unauthorized],
        ["deposit", (param, pwd, curBal) => [true, curBal + param, null], authorized],
        ["withdraw", (param, pwd, curBal) => [curBal >= param, curBal >= param ? curBal - param : curBal, null], authorized],
        ["balance", (param, pwd, curBal) => [true, curBal, curBal], authorized],
    ],
    [unauthorized]: [
        ["login", (param, pwd, curBal) => [param === pwd, curBal, null], authorized],
        ["logout", (param, pwd, curBal) => [false, curBal, null], unauthorized],
        ["deposit", (param, pwd, curBal) => [false, curBal, null], unauthorized],
        ["withdraw", (param, pwd, curBal) => [false, curBal, null], unauthorized],
        ["balance", (param, pwd, curBal) => [false, curBal, null], unauthorized],
    ],
};

// ATM class
class ATM {
    constructor(initState, initBalance, password, transitionTable) {
        this.state = initState;
        this.balance = initBalance;
        this.password = password;
        this.transitionTable = transitionTable;
    }

    next(action, param) {
        const transitions = this.transitionTable[this.state];
        for (let [transitionAction, check, nextState] of transitions) {
            if (action === transitionAction) {
                const [passed, newBalance, result] = check(param, this.password, this.balance);
                if (passed) {
                    this.balance = newBalance;
                    this.state = nextState;
                    console.log(`Action: ${action}, Param: ${param}, Success: ${passed}, New State: ${this.state}, Balance: ${this.balance}`);
                    return [true, result];
                }
            }
        }
        console.log(`Action: ${action}, Param: ${param}, Success: false, State: ${this.state}, Balance: ${this.balance}`);
        return [false, null];
    }
}

// Main function to handle input and output
async function main() {
    const input = fs.readFileSync("input.txt", "utf8").split("\n");
    
    const password = input[0].trim();
    const initialBalance = parseInt(input[1].trim());
    const atm = new ATM(unauthorized, initialBalance, password, transitionTable);

    const output = [];
    const numQueries = parseInt(input[2].trim());

    for (let i = 0; i < numQueries; i++) {
        const [action, param] = input[i + 3].trim().split(" ");
        const paramValue = action === "deposit" || action === "withdraw" ? parseInt(param) : param;

        const [success, res] = atm.next(action, paramValue);
        if (res !== null) {
            output.push(`Success=${success} ${atm.state} ${res}`);
        } else {
            output.push(`Success=${success} ${atm.state}`);
        }
    }

    fs.writeFileSync("output.txt", output.join("\n"));
    console.log("Output written to output.txt");
}

// Run the program
main();
