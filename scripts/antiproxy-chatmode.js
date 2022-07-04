module.exports = (() => {
    const proxy_check = require('proxycheck-node.js');
    let name = "AntiProxy ChatMode";
    let version = "1.0.0";
    let config = require("../config.json");
    setInterval(() => {
        config = require("../config.json");
    }, 1500);

    function install() {
        server.events.on("chat", async function(client, msg) {
            if (config.antiProxy.status == "chatmode") {
      let result = await server.antiProxy.check(client.ip, {
        vpn: server.config.antiProxy.vpnCheck,
        limit: server.config.antiProxy.limit
      });
      if (result.status == "denied" && result.message[0] == "1") {
        console.log(server.chalk.red("Check your dashboard the queries limit reached!"))
      }
      if (result.error || !result[client.ip]) return;
      if (result[client.ip].proxy == "yes") {
        server.BansManager.addBanIp(client.ip, 300, "proxy");
      }
    }
        })
    }
    return {
        install,
        name,
        version
    }
})()