// t.me/BotTinyBot

require('dotenv').config();
const axios = require('axios'); // for api connection
const dns = require("dns"); // for ip address

// for the bot
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TOKEN;
const bot = new TelegramBot(token, {polling: true});

// for database connection
const { createPool } = require("mysql")
const pool = createPool({
    host:"localhost",
    database:"message",
    user:"root",
    password:""
})

// view notes
bot.onText(/\/view_notes/, (msg) => {
    pool.query("select * from message", (err, res) =>{
        if(err){
            console.log("Error in connecting Db");
            throw err;
        }

        let returnData = ""
        for (let i in res){
            let index = (parseInt(i) + 1);
            let message = res[i].message;
            returnData = `${returnData} ${index}. ${message} \n`
        }
        bot.sendMessage(msg.chat.id,returnData.toString("utf-8"));
    })
});

// save notes
bot.onText(/\/save_notes/, function(msg, match){

    const data = match.input.slice(12);

    pool.query(`INSERT into message(message)values('${data}')`, (err, res) =>{
        if(err){
            console.log("Error in connecting Db");
        }
        bot.sendMessage(msg.chat.id,"Notes had successfully added");
    })
});

// arrow functions for weather
const getWeather = (city) => { 
    const appID = process.env.APIID;
    return axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&APPID=${appID}`);
}

// weather
bot.onText(/\/weather/, async function(msg, match){
    const city = match.input.slice(9);

    try{
        // destructuring
        const {data} = await getWeather(city);

        const cityName = data.name;
        const weather = data.weather[0].main;
        const description = data.weather[0].description
        const temperature = String(data.main.temp);
        const humidity = data.main.humidity;
        const pressure = String(data.main.pressure);

        const regionNames = new Intl.DisplayNames(['en'], {type: 'region'});regionNames.of('US');  // "United States"
        const country = regionNames.of(data.sys.country);

        bot.sendMessage(msg.chat.id, 
        `****** ${cityName} ******
Temperature: ${temperature}°C
Humidity: ${humidity}%
Weather:${weather}       
Description:${description}       
Pressure: ${pressure}        
Country: ${country}
        `)

    }catch(error){
        bot.sendMessage(msg.chat.id,"Unable to check the weather");
        console.log(error);
    }
})

// getting ip address
bot.onText(/\/ipv4/,function(msg, match){

    const url = match.input.slice(6);

    // get the IPv4 address
    dns.resolve4(url, (err, addresses) => {
        // if any err
        if (err) {
            bot.sendMessage(msg.chat.id,"Unable to find ip address");
            console.log(err);
            return;
        }
        bot.sendMessage(msg.chat.id,addresses[0]);
    });
})

// instructions
bot.onText(/\/start/,function(msg, match){
    bot.sendMessage(msg.chat.id,`The command available for tinybots:
1. /weather <city name>
2. /ipv4 <website>
3. /save_notes <message>
4. /view_notes

* Small suggestion: 
- the website be in the format of www.xxx.com`);
})