# Actual Budget Credit Card Balancer

For those now using [Actual Budget][ab] after getting used to YNAB's way of handling
Credit Cards, this script may help you.

**This script does not modify or write to the budget in any way.**

[ab]:https://actualbudget.com/

## Usage

```shell
yarn ts-node balance-ccs.ts
```

Output is similar to:

```text
...
Chase Freedom *0000:
        Balance: -3409.8
        Category Bal: -3072.74
        Difference: -337.06
```

A negative difference indicates overspending, a positive difference may indicate
you can pay more towards your balance.

## Assumptions

* Your credit card debt balances are in a category group names "Credit Cards &
  Loans"
* Those categories are named similarly to the corresponding accounts. Script
  uses [fuse.js] to match accounts and categories.

[fuse.js]: https://www.fusejs.io/
