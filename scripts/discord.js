module.exports = (() => {
    const Discord = require("discord.js");
    let name = "Discord Gateway";
    let version = "1.0.3";

    function install() {
        let config = new server.ConfigManager(name, {
            guildId: "991725508771446874",
            channelId: {
                "991725752707993701": "main"
            },
            prefix: "y!"
        }).config

        let fs = require("fs");

        const bot = new Discord.Client({
            partials: ['MESSAGE', 'CHANNEL'],
            intents: ['GUILD_MESSAGES', 'GUILDS']
        });
        server.bot = bot;

        function onlyLetters(str){
            let numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
            let newString = "";

            for(let i in numbers){
                newString = str.replaceAll(numbers[i], "");
            };

            return newString;
        };

        function getKeyByValue(object, value) {
            for (var prop in object) {
                if (object.hasOwnProperty(prop)) {
                    if (object[prop] === value)
                        return prop;
                };
            };
            return false;
        };

        function strToBool(str){
            if(str == "false") return false;
            if(str == "true") return true;
            if(str == "1") return true;
            if(str == "0") return false;
            if(str == "on") return true;
            if(str == "off") return false;
        };
        
        bot.on("messageCreate", async (message) => {
            let serverCfg = require("../config.json");
            let ranked = require("../ranked.json");

            if (message.author.bot) return;
            if (message.channel.type === "dm") return;
            let msget = message.toString();
            let args = msget.split(" ");
            let cmd = args[0].slice(config.prefix.length);
            if (message.channel.id == "991725752707993701") {
                server.players.sendToWorld("main", `[D] [${message.author.username}]: ${message.content}`);
            };
            if(cmd == "setOpt"){
                if(ranked[message.author.id] >= 2) return;
                let option = args[1];
                let value = args[2];

                switch(option){
                    case "antiproxy":
                        serverCfg.antiProxy.status = strToBool(value) || false;
                        fs.writeFileSync("../config.json", JSON.stringify(serverCfg));
                        break;
                    case "antibot":
                        break;
                    case "maxcon":
                        if(ranked[message.author.id] !== 3) return;
                        serverCfg.maxConnectionsPerIp = parseInt(value) || 6;
                        fs.writeFileSync("../config.json", JSON.stringify(serverCfg));
                        break;
                    case "antibot":
                        break;
                    case "antibanbypass":
                        break;
                    case "countryban":
                        serverCfg.CountryBan = strToBool(value) || false;
                        fs.writeFileSync("../config.json", JSON.stringify(serverCfg));
                        break;
                    default:
                        message.reply("Usage: y!setOpt [option] [value] | options: y!status");
                        break;
                };
            };
            if(cmd == "status"){
                const embed = new Discord.MessageEmbed()
                .setTitle("Status")
                .setColor('#0091ff')
                .setDescription("Here you can see the enabled server options, instead of asking the admins/mods for it.")
                .setTimestamp()
                .addField('AntiProxy', serverCfg.antiProxy.enabled ? "Enabled" : "Disabled" || serverCfg.antiProxy.toString(), true)
                .addField('MaxConns/IP', serverCfg.maxConnectionsPerIp.toString(), true)
                .addField('AntiBot', serverCfg.AntiBot ? "Enabled" : "Disabled", true)
                .addField('AntiBanBypass', serverCfg.AntiBanBypass ? "Enabled" : "Disabled", true)
                .addField('CountryBan', serverCfg.CountryBan ? "Enabled" : "Disabled", true)
                message.channel.send({
                    embeds: [embed]
                });
            };
            if(cmd == "addcb"){
                if(ranked[message.author.id] >= 2){
                    let cbans = server.cbans;
                    let country = args[1];

                    if(!cbans[country]){
                        cbans[country] = true;
                        server.cbans = cbans;
                    };
                };
            };
            if(cmd == "delcb"){
                if(ranked[message.author.id] >= 2){
                    let cbans = server.cbans;
                    let country = args[1];

                    if(cbans[country]){
                        delete cbans[country];
                        server.cbans = cbans;
                    };
                };
            };
            if(cmd == "cbans"){
                let cbans = server.cbans;

                const embed = new Discord.MessageEmbed()
                .setTitle("Country Bans")
                .setColor('#0091ff')
                .setDescription("Banned countries")
                .setTimestamp();
                for(let i in cbans){
                    embed.addField(i, cbans[i] ? "Banned" : "False" || "none", true)
                };
                setTimeout(() => {
                    message.channel.send({
                        embeds: [embed]
                    });
                }, 2000);
            };
            if(cmd == "banip"){
                if(!args[1] && !args[2]) return; // y!banip 255.255.255.255 300 griefing something
                let reason = args.splice(3).toString() || "No reason";
                let dura = parseInt(args[2]);
                let ip = args[1];

                // checking for special rank
                if(ranked[message.author.id] >= 3){
                    // command
                    if(!server.clients[id]) return;
                    server.banBansManager.addBanIp(ip, reason, dura);
                };
            };
            if(cmd == "ban"){
                if(!args[1]) return; // y!ban 32916 4w grief
                let reason = args.splice(3).toString() || "No reason";
                let dura = parseInt(args[2]); // secounds
                let durationTimeUnit = onlyLetters(args[2]);
                if(!args[2]) dura = 0;
                let realDuration = dura;
                let id = args[1];

                if (durationTimeUnit == "m" || durationTimeUnit == "minutes") {
                    realDuration = realDuration * 60;
                  } else if (durationTimeUnit == "h" || durationTimeUnit == "hours") {
                    realDuration = realDuration * 60 * 60;
                  } else if (durationTimeUnit == "d" || durationTimeUnit == "days") {
                    realDuration = realDuration * 60 * 60 * 24;
                  } else if (durationTimeUnit == "y" || durationTimeUnit == "years") {
                    realDuration = realDuration * 60 * 60 * 24 * 365;
                  } else if (durationTimeUnit == "w" || durationTimeUnit == "weeks") {
                    realDuration = realDuration * 60 * 60 * 168;
                  };

                // checking for special rank
                if(ranked[message.author.id] >= 2){
                    // command
                    if(!server.clients[id]) return;
                    server.banBansManager.addBanIp(server.clients[id].ip, reason, realDuration);
                };
            };
        });
        server.events.on("chat", function(client, msg) {
            let channelId = getKeyByValue(config.channelId, client.world);
            if (channelId == false) return;
            let before = client.before.replace(/<(?:alt=("|')(.+?)\1|.|\n)+>/gm, "$2");

            if(!bot.guilds.cache.get(config.guildId)) return;
            bot.guilds.cache.get(config.guildId).channels.cache.get(channelId).send(`${before}: ${msg}`);
        });
        bot.login(process.env.token);
    }
    return {
        install,
        name,
        version
    }
})()