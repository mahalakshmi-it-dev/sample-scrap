"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const puppeteer_1 = __importDefault(require("puppeteer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function scrapePurchaseItems() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        // Launch a new browser instance
        const browser = yield puppeteer_1.default.launch({ headless: false });
        try {
            // Retrieve login Credentials and URL from .env file
            const email = (_a = process.env.email) !== null && _a !== void 0 ? _a : '';
            const pwd = (_b = process.env.password) !== null && _b !== void 0 ? _b : '';
            const url = (_c = process.env.url) !== null && _c !== void 0 ? _c : '';
            const page = yield browser.newPage();
            // Navigate to the login page
            yield page.goto(url + 'account/login');
            // Waiting for login page to load
            yield page.waitForSelector('#CustomerLoginForm');
            yield page.waitForSelector('#CustomerEmail');
            yield page.waitForSelector('#CustomerPassword');
            yield page.waitForSelector('button.btn.btn--full');
            yield page.type('#CustomerEmail', email);
            yield page.type('#CustomerPassword', pwd);
            yield page.click('button.btn.btn--full');
            // Waiting for the login page to complete and the next page to load
            yield page.waitForNavigation();
            // Navigate to the "purchased items" page
            yield page.goto(url + 'account');
            // Scraping the purchased items
            const purchasedItems = yield page.evaluate(() => {
                const table = document.querySelector('.table--responsive');
                if (!table) {
                    return 'Error: No orders placed yet';
                }
                const tableRows = Array.from(document.querySelectorAll('tr'));
                const tableHeaders = Array.from(tableRows[0].querySelectorAll('th')).map(th => th.innerText.trim());
                return tableRows.slice(1).map(row => {
                    const tableCells = Array.from(row.querySelectorAll('td'));
                    let rowData = {};
                    tableCells.forEach((cell, index) => {
                        if (tableHeaders[index]) {
                            rowData[tableHeaders[index]] = cell.innerText.trim();
                        }
                    });
                    return rowData;
                });
            });
            if (typeof purchasedItems === 'string' && purchasedItems.startsWith('Error')) {
                console.error(purchasedItems);
            }
            else {
                console.log(JSON.stringify(purchasedItems, null, 2));
            }
        }
        catch (error) {
            console.error("Error: " + error);
        }
        finally {
            // Close the browser
            yield browser.close();
        }
    });
}
scrapePurchaseItems();
