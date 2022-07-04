module.exports = (() => {
    let name = 'api';
    let version = '1.0.0';

    function isBanned(ip){
        if(!ip) return false;
        let bans = require("../bans.json");

        if(bans[ip]){
            return true;
        } else {
            return false;
        };
    };

    function install(){
        const path = require('path');
        const fs = require('fs');
        let config = require("../config.json");
        let app = server.api;

        setInterval(() => {
            config = require("../config.json");
        }, 1000);

        app.get('/', (req, res) => {
            res.sendfile(path.resolve("./client/index.html"));
        });

        let files = [];

        // thanks arthurDent ( https://stackoverflow.com/users/8842015/arthurdent )
        const getFilesRecursively = (directory) => {
        const filesInDirectory = fs.readdirSync(directory);
        for (const file of filesInDirectory) {
            const absolute = path.join(directory, file);
            if (fs.statSync(absolute).isDirectory()) {
                getFilesRecursively(absolute);
            } else {
                files.push(absolute);
                app.get("/"+absolute.replace("client/", ""), (req, res) => {
                    res.sendfile(path.resolve(`./${absolute}`));
                });
                };
            };
        };
        getFilesRecursively("./client/");
        
        app.get('/api',  (req, res) => {
            let ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress).split(",")[0].replace('::ffff:', '');
            let yourConns = server.players.getAllPlayersWithIp(ip).length;
            let captchaEnabled = config.captcha.enabled;
            let maxConnectionsPerIp = config.maxConnectionsPerIp;
            let users = server.players.getAllPlayers().length;
            
            let toReturn = {
                banned: isBanned(ip) ? -1 : 0,
                captchaEnabled: captchaEnabled,
                maxConnectionsPerIp: maxConnectionsPerIp,
                users: users,
                yourConns: yourConns,
                yourIp: ip
            };

            res.send(JSON.stringify(toReturn));
        });
    };

    return {
        install,
        name,
        version
    };
})();