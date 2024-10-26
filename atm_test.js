const readline = require("readline");
const fs = require("fs");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

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
                    return [true, result];
                }
            }
        }
        return [false, null];
    }
}

// Helper function to get input and handle the ATM operations
async function main() {
    const input = [];
    for await (const line of rl) {
        input.push(line);
        if (input.length > 2 && input.length - 3 === parseInt(input[2])) break;
    }

    rl.close();

    const password = input[0];
    const initialBalance = parseInt(input[1]);
    const atm = new ATM(unauthorized, initialBalance, password, transitionTable);

    const output = [];
    const numQueries = parseInt(input[2]);

    for (let i = 0; i < numQueries; i++) {
        const [action, param] = input[i + 3].split(" ");
        const paramValue = action === "deposit" || action === "withdraw" ? parseInt(param) : param;

        const [success, res] = atm.next(action, paramValue);
        if (res !== null) {
            output.push(`Success=${success} ${atm.state} ${res}`);
        } else {
            output.push(`Success=${success} ${atm.state}`);
        }
    }

    const outputPath = process.env.OUTPUT_PATH || "output.txt";
    fs.writeFileSync(outputPath, output.join("\n"));
    console.log("Output written to", outputPath);
}

// Run the program
main();
