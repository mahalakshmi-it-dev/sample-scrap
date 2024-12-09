import puppeteer from 'puppeteer';
import dotenv from 'dotenv';
dotenv.config();

async function scrapePurchaseItems() {
     // Launch a new browser instance
    const browser = await puppeteer.launch({ headless: false });

    try {
        // Retrieve login Credentials from .env file
        const email : string = process.env.email?? '';
        const pwd : string = process.env.password?? '';
        const url : string = process.env.url?? '';

        if (!email || !pwd || !url) {
            console.error("Important environmental variables are missing");
            process.exit(1);
        }

        const page = await browser.newPage();

        // Navigate to the login page
        await page.goto(url+'account/login');

        // Waiting for login page to load
        await page.waitForSelector('#CustomerLoginForm');
        await page.waitForSelector('#CustomerEmail'); 
        await page.waitForSelector('#CustomerPassword'); 
        await page.waitForSelector('button.btn.btn--full');

        await page.type('#CustomerEmail', email);
        await page.type('#CustomerPassword', pwd);

        await page.click('button.btn.btn--full');

        // Waiting for the login page to complete and the next page to load
        await page.waitForNavigation({ waitUntil: 'domcontentloaded' });

        const errorMessage = await page.evaluate(() => {
            const li = document.querySelectorAll('.errors ul li')[0];
            return li ? li.textContent?.trim() : null;
        });
    
        if (errorMessage) {
            await browser.close();
            throw new Error('Invalid Email or password');
        }
    
        console.log('Login successful!');
        
        // Navigate to the "purchased items" page
        await page.goto(url+'account');

        // Scraping the purchased items
        const purchasedItems = await page.evaluate(() => {

            const table = document.querySelector('.table--responsive');

            if (!table) {
                return 'Error: No orders placed yet';
            }

            const tableRows = Array.from(document.querySelectorAll('.table--responsive tr'));

            const tableHeaders = Array.from(tableRows[0].querySelectorAll('th')).map(th => th.innerText.trim());

            return tableRows.slice(1).map(row => {
                const tableCells = Array.from(row.querySelectorAll('td'));
                let rowData: { [key: string]: string } = {};

                tableCells.forEach((cell, index) => {
                    if (tableHeaders[index]) {
                        rowData[tableHeaders[index]] = cell.innerText.trim();
                    }
                });

                return rowData;
            
            });
        }); 
        console.log(JSON.stringify(purchasedItems, null, 2));
       
    } catch (error) {
        console.error("Error: " + error);
    } finally {
        // Close the browser
        await browser.close();
    }
}

scrapePurchaseItems();