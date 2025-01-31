require("dotenv").config();
const api = require("@actual-app/api")
const fs = require("fs");
const fuse = require("fuse.js");

const ACTUAL_SERVER = process.env.ACTUAL_BUDGET_SERVER;
const SERVER_PASSWORD = process.env.ACTUAL_BUDGET_PASSWORD;
const BUDGET_SYNC_ID = process.env.BUDGET_SYNC_ID;
const BUDGET_PASSWORD = process.env.BUDGET_PASSWORD;
const CATEGORY_GROUP_NAME = process.env.CATEGORY_GROUP_NAME;

console.log(`Actual server: ${ACTUAL_SERVER}`);

(async () => {
    fs.mkdir("./data", undefined, (err) => {
        if (err) {
            if (err.code === "EEXIST") {
                return;
            } else {
                console.error(err);
            }
        }
    })
})();

(async () => {
    await api.init({
        dataDir: "./data",
        serverURL: ACTUAL_SERVER,
        password: SERVER_PASSWORD,
    });
    console.log("API initialized");

    await api.downloadBudget(BUDGET_SYNC_ID, BUDGET_PASSWORD ? {
        password: BUDGET_PASSWORD,
    } : undefined);
    console.log("Budget downloaded");

    const date = new Date();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    let accounts = (await api.getAccounts())
        .filter((account) => !account.closed && !account.offbudget);
    for(let i = 0; i < accounts.length; i++) {
        const balance = await api.getAccountBalance(accounts[i].id);
        accounts[i].balance = balance;
    }
    let budget = await api.getBudgetMonth(`${year}-${month}`);
    // console.log(budget);

    console.log("API Shutting Down...");
    await api.shutdown();

    const ccCategories = budget.categoryGroups
        .find((group) => group.name === CATEGORY_GROUP_NAME)
        .categories;
    // match accounts to categories
    const options = {
        includeScore: true,
        keys: ["name"]
    };
    const _fuse = new fuse(accounts, options);
    for(let i=0; i<ccCategories.length; i++) {
        const category = ccCategories[i];
        const result = _fuse.search(category.name);
        if (result.length > 0) {
            const account = result[0].item;
            account.category = category;
        }
    }
    // filter out accounts without categories
    const ccAccounts = accounts
        .filter((account) => account.category);
    console.log(`Found ${ccAccounts.length} accounts with categories`);
    ccAccounts.forEach((account) => {
        console.log(`${account.name}:`);
        console.log(`\tBalance: ${account.balance / 100}`);
        console.log(`\tCategory Bal: ${account.category.balance / 100}`);
        console.log(`\tDifference: ${(account.balance - account.category.balance) / 100}`);
    });
})();