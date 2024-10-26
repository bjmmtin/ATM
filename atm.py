from typing import Dict, Optional, Tuple, Any
import os

Action = str

class State:
    def __init__(self, state):
        self.state = state

    def __str__(self):
        return self.state

authorized = State('authorized')
unauthorized = State('unauthorized')

# Transition table
transition_table = {
    authorized: [
        ('login', lambda param, pwd, cur_bal: (False, cur_bal, None), authorized),
        ('logout', lambda param, pwd, cur_bal: (True, cur_bal, None), unauthorized),
        ('deposit', lambda param, pwd, cur_bal: (True, cur_bal + param, None), authorized),
        ('withdraw', lambda param, pwd, cur_bal: (cur_bal >= param, cur_bal - param if cur_bal >= param else cur_bal, None), authorized),
        ('balance', lambda param, pwd, cur_bal: (True, cur_bal, cur_bal), authorized),
    ],
    unauthorized: [
        ('login', lambda param, pwd, cur_bal: (param == pwd, cur_bal, None), authorized),
        ('logout', lambda param, pwd, cur_bal: (False, cur_bal, None), unauthorized),
        ('deposit', lambda param, pwd, cur_bal: (False, cur_bal, None), unauthorized),
        ('withdraw', lambda param, pwd, cur_bal: (False, cur_bal, None), unauthorized),
        ('balance', lambda param, pwd, cur_bal: (False, cur_bal, None), unauthorized)
    ]
}

init_state = unauthorized

class ATM:
    def __init__(self, init_state: State, init_balance: int, password: str, transition_table: Dict):
        self.state = init_state
        self._balance = init_balance
        self._password = password
        self._transition_table = transition_table

    def next(self, action: Action, param: Optional) -> Tuple[bool, Optional[Any]]:
        try:
            for transition_action, check, next_state in self._transition_table[self.state]:
                if action == transition_action:
                    passed, new_balance, res = check(param, self._password, self._balance)
                    if passed:
                        self._balance = new_balance
                        self.state = next_state
                        return True, res
        except KeyError:
            pass
        return False, None

if __name__ == "__main__":
    # Change 'input.txt' to the path of your input file
    with open('input.txt', 'r') as f:
        password = f.readline().strip()
        init_balance = int(f.readline().strip())
        atm = ATM(init_state, init_balance, password, transition_table)
        
        q = int(f.readline().strip())  # Number of queries
        output_path = os.environ.get('OUTPUT_PATH', 'default_output.txt')
        
        with open(output_path, 'w') as fptr:
            for _ in range(q):
                action_input = f.readline().strip().split()
                action_name = action_input[0]
                try:
                    action_param = action_input[1]
                    if action_name in ["deposit", "withdraw"]:
                        action_param = int(action_param)
                except IndexError:
                    action_param = None
                success, res = atm.next(action_name, action_param)
                if res is not None:
                    fptr.write(f"Success={success} {atm.state} {res}\n")
                else:
                    fptr.write(f"Success={success} {atm.state}\n")
