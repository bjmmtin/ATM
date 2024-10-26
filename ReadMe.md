
# Description
### An ATM (Automated Teller Machine) is a machine that allows people to perform financial transactions without the need for a bank teller. 
```
<password>
<initial_balance>
<number_of_queries>
<action1> <param1>
<action2> <param2>
...
```
# Sample Input

```
    hacker
    1000
    5
    login hacker
    deposit 200
    withdraw 100
    balance
    logout
```
# Sample OutPut

```
    Success=True authorized
    Success=True authorized
    Success=True authorized
    Success=True authorized 1100
    Success=True unauthorized
```
