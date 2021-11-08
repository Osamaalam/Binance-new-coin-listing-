const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const cron = require('node-cron');
const express = require('express');
const fs = require('fs');

const url = 'https://www.binance.com/en/support/announcement/c-48';

async function configureBrowser() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    return page;
}

async function checkChange(page) {
    await page.reload();
    let html = await page.evaluate(() => document.body.innerHTML);
     //console.log(html);
     const $ = cheerio.load(html);



    $('#link-0-0-p1').each(function() {
        let NewCoin = $(this).text();
        let Address = $(this).attr("href");
        let Compare = "Binance Will List";


        if(String(NewCoin).includes(Compare)){


          //check if its already present in compare file
          fs.readFile('compare.txt', 'utf8' , (err, data) => {
            if (err) {
              console.error(err)
              return
            }
            //Writes data if same statement is not present
            if(String(data) != String(NewCoin)){
                  fs.writeFile('compare.txt', NewCoin, err => {
                    if (err) {
                      console.error(err)
                      return
                    }
                    //file written successfully
                  })

                  let Index = NewCoin.indexOf("(");
                  let Length = Index-18;
                  let Name = NewCoin.substr(18, Length);
                  console.log(Name);

                   //Getting token address
                  let TokenUrl = 'https://www.binance.com'+ Address;
                  configureBrowserAgain(TokenUrl);

            }
                  else{
                    console.log("Already done")
                  }

          })


        }
        else{
          console.log("NoNewCoin");
        }


    });



}
//Token check

async function configureBrowserAgain(TokenUrl) {
    const tokenPageUrl = await TokenUrl;
    const browser = await puppeteer.launch();
    const tokenPage = await browser.newPage();
    await tokenPage.goto(tokenPageUrl);
    checkToken(tokenPage);
}

async function checkToken(tokenPage) {
    await tokenPage.reload();
    let html = await tokenPage.evaluate(() => document.body.innerHTML);
     //console.log(html);
     const $ = cheerio.load(html);


     $('.css-li4l4s:contains("Block Explorer")').each(function() {
         let Address = $(this).attr("href");

         let Index = (Address.lastIndexOf("token/"))+6;
         let Length = Address.length - Index;
         let TokenAdress = Address.substr(Index, Length);

                   console.log(TokenAdress);
     });

}


async function startTracking() {
    const page = await configureBrowser();
      checkChange(page);
}

app = express();

cron.schedule("*/15 * * * * *", function() {
    startTracking();
});


app.listen(3000);
