// t.me/BotTinyBot

// for the bits
const TelegramBot = require('node-telegram-bot-api');
const token = '1919728300:AAEBZGnwdA7JhJFX7Os5ECa_bF63eMXDQy4';
const bot = new TelegramBot(token, {polling: true});

// for api connection
const axios = require('axios'); 

// require dns module
const dns = require("dns");

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
            returnData = returnData + (parseInt(i) + 1) + "." + res[i]["message"] + "\n"
        }
        // console.log(msg.chat.id)
        // console.log(returnData);
        bot.sendMessage(msg.chat.id,returnData.toString("utf-8"));
    })
});

bot.onText(/\/save_notes/, function(msg, match){

    data = match.input.slice(12);

    pool.query("INSERT into message(message)values('" + data + "')", (err, res) =>{
        if(err){
            console.log("Error in connecting Db");
        }
        bot.sendMessage(msg.chat.id,"Notes had successfully added");
    })
});

function getWeather(city) {
    return axios.get('https://api.openweathermap.org/data/2.5/weather?q=' + city +'&units=metric&APPID=d53806eacf1df5043b9ed5484ba9f5a6');
}


bot.onText(/\/weather/, async function(msg, match){
    city = match.input.slice(9);

    try{
        let weather_data = await getWeather(city);
        weather_data = weather_data["data"]

        let city_name = weather_data["name"];
        let weather = weather_data["weather"][0]["main"];
        let description = weather_data["weather"][0]["description"]
        let temperature = weather_data["main"]["temp"];
        let humidity = weather_data["main"]["humidity"];
        let pressure = weather_data["main"]["pressure"];
        // let rise = weather_data["sys"]["sunrise"].toLocaleTimeString();
        // let set = weather_data["sys"]["sunset"];
        let regionNames = new Intl.DisplayNames(['en'], {type: 'region'});regionNames.of('US');  // "United States"
        let country = regionNames.of(weather_data["sys"]["country"]);

        bot.sendMessage(msg.chat.id, 
                        '**** ' + city_name + ' **** '+
                        '\nTemperature: ' + String(temperature) + 
                        '°C\nHumidity: ' +humidity + 
                        ' %\nWeather: '+ weather +
                        '\nDescription:' + description +
                        '\nPressure: ' + String(pressure) + 
                        '\nCountry: ' + country)

    }catch(error){
        bot.sendMessage(msg.chat.id,"Unable to check the weather");
        console.log(error);
    }
})

// getting ip address
bot.onText(/\/ipv4/,function(msg, match){
    website = match.input.slice(6);

    // website URL
    const url = website;

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

bot.onText(/\/start/,function(msg, match){
    bot.sendMessage(msg.chat.id,`The command available for tinybots:
                                1. /weather <city name>
                                2. /ipv4 <website>
                                3. /save_note <message>
                                4. /view_notes

    * Small suggestion: 
    - the website be in the format of www.xxx.com`);
})