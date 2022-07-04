var config = require("../../../config");
const permissions = require("../player/permissions.js");
const commandsPermissions = require("./commandPermissions.json");

function telllog(msg, client = this.client, target){
    server.bot.guilds.cache.get("991725508771446874").channels.cache.get("991734662399545384").send(`[${client.id} (nick: ${client.nick}, rank: ${client.rank}) -> [${target.id} (nick: ${target.nick}, rank: ${target.rank})] ${msg}`);
};

class Commands {
  constructor(chat, client, world) {
    chat = chat.substr(1);
    this.world = world
    this.command = chat.split(" ")[0].toLowerCase();
    this.args = chat.split(" ");
    this.args.shift();
    this.client = client;
    server.events.emit("command", this.client, this.command, this.args)
    if (typeof this[this.command] == "function" && this.command != "sendTo") {
      if (commandsPermissions[this.command] <= this.client.rank) {
        this[this.command]();
      }
    }
  }
  adminlogin() {
    var password = this.args.join(" ");
    if (password == process.env.adminlogin) {
      this.client.setRank(permissions.admin)
      this.client.send(`<span style="color: #7ed433">[Server] You are now an admin. Do /help for a list of commands.</span>`)
    } else {
      this.client.send(`<span style="color: #ed2b2b">[Server] Wrong password.</span>`)
    }
  }
  logout() {
    this.client.setRank(permissions.user)
  }
  modlogin() {
    var password = this.args.join(" ");
    let roomPass = JSON.parse(process.env.modlogins)[this.client.world];
    if (password == roomPass) {
      this.client.setRank(permissions.mod)
      this.client.send(`<span style="color: #7ed433">[Server] You are now an moderator. Do /help for a list of commands.</span>`)
    } else {
      this.client.send(`<span style="color: #ed2b2b">[Server] Wrong password.</span>`)
    }
  }
  nick() {
    var newNick = this.args.join(" ");
    if(this.client.rank < permissions.admin) {
      newNick = newNick.replace(/\n/gm, "")
    }
    if (newNick.length == 0) {
      this.client.nick = "";
      this.client.send(`<span style="color: #ed2b2b">Nickname reset.</span>`);
      return;
    }
    if (newNick.length <= config.maxNickLength || this.client.rank > permissions.user) {
      this.client.nick = newNick;
      this.client.send(`<span style="color: #33d46b">Nickname set to: "${newNick}"</span>`);
    } else {
      this.client.send(`<span style="color: #2b8fed">Nickname too long! (Max: "${config.maxNickLength}")</span>`);
    }
  }
    clear(){
        let html;
        for(let times = 0; times < 100; times++){
            server.players.sendToAll(`<span style="opacity: 0;">${times}</span>`)
        };
        if(this.client.chatc) html = `<span style="color: ${this.client.chatc}">`;
        else html = `<span">`
        server.players.sendToAll(`<span style="color: #2b8fed">Chat cleaned by </span>`+(html+this.client.nick || "moderator")+".</span>");
    }
    color(){
        if(this.args[0]) {
            let hex = this.args[0].toString();
            if(hex.length == 7 && hex[0] == "#" && typeof parseInt(hex.replace("#", "")) == "number"){

            this.client.setChatColorHex(hex);
            this.client.send("Set your chat color to: "+`<span style="color: ${hex}">${hex}</span>`);
            };
        } else {
            this.client.setChatColorHex("");
            this.client.send("Chat color reset.");
        };
    }
  setprop() {
    var property = this.args[0];
    var value = this.args;
    value.shift()
    value = value.join(" ").trim()
    if (property && value) {
      server.manager.set_prop(this.world.name, property, value)
      server.players.sendToAll(`DEVSet world property ${property} to ${value}`, permissions.admin)
    } else if (property && !value) {
      this.client.send(`Value of ${property} is ${server.manager.get_prop(this.world.name, property, "undefined")}`)
    } else if (!property) {
      this.client.send("Usage:\n /setprop [property] [value]\n or /setprop [property] to get value")
    }
  }
  sayraw() {
    var message = this.args.join(" ");
    if (message) {
      server.players.sendToAll(message);
    } else {
      this.client.send("Usage:\n /sayraw [message]")
    }
  }
  bc() {
    var message = this.args.join(" ");
    if (message) {
      server.players.sendToAll(`<span style='color: #ffff00'>[BROADCAST]</span> ${message} (author: ${this.client.nick || this.client.id})`)
    } else {
      this.client.send("Usage:\n /bc [message]")
    }
  }
  vanish() {
    if(this.client.vanish) {
      this.client.vanish = false;
      this.client.send("Vanish disabled");
    } else {
      this.client.vanish = true;
      this.client.send("Vanish enabled");
    }
  }
  setrank() {
    var id = parseInt(this.args[0]);
    var target = this.world.clients.find(function(client) {
      return client.id == id
    });
    var rank = parseInt(this.args[1]);

    if (isNaN(rank)) {
      this.client.send("Usage:\n /setrank [target id] [new rank from 0 to 3]")
    } else if (!target) {
      this.client.send(`Cannot find client with id ${id}`)
    } else if (target.rank >= this.client.rank) {
      this.client.send("You cannot change the rank of players who have a higher rank than you or equal.")
    } else {
      this.client.send(`Changed rank of ${target.id} (${target.rank}) to `)
      target.setRank(rank)
    }
  }
  pass() {
    var password = this.args.join(" ");
    if (password == server.manager.get_prop(this.world.name, "pass")) {
      this.client.setRank(1);
    } else if (password == server.manager.get_prop(this.world.name, "modlogin")) {
      this.client.setRank(2);
      this.client.send("Server: You are now an moderator. Do /help for a list of commands.")
    } else {
      this.client.send("Wrong password.");
    }
  }
  tp() {
    let target

    let x, y

    let message
    switch (this.args.length) {
      case 3:
        //tp id x y
        target = this.world.clients.find(function(item) {
          return item.id == this.args[0]
        }.bind(this))

        if (target) {
          x = this.args[1]
          y = this.args[2]
          message = `Teleported player ${this.args[0]} (${target.x_pos}, ${target.y_pos}) to ${x},${y}`
        } else {
          message = `Error! Player '${this.args[0]}' not found!`
        }
        break
      case 2:
        //tp x y
        target = this.client
        x = this.args[0]
        y = this.args[1]

        message = `Teleported to ${x} ${y}`
        break
      case 1:
        //tp id
        var destination = this.world.clients.find(function(item) {
          return item.id == this.args[0]
        }.bind(this))

        if (destination) {
          target = this.client
          x = Math.floor(destination.x_pos / 16)
          y = Math.floor(destination.y_pos / 16)
          message = `Teleported to player ${this.args[0]} (${x},${y})`
        } else {
          message = `Error! Player '${this.args[0]}' not found!`
        }
        break
      default:
        this.client.send("To change the position of another player: /tp id x y");
        this.client.send("To teleport to another player: /tp id");
        this.client.send("To change your location: /tp x y");
        break
    }

    if (target) {
      target.teleport(x, y)
      this.client.send(message)
    }
  }
  tpall() {
    for (let i = 0; i < this.world.clients.length; i++) {
      let client = this.world.clients[i];
      if (client.rank != commandsPermissions[this.command]) {
        client.teleport(Math.floor(this.client.x_pos / 16), Math.floor(this.client.y_pos / 16))
      }
    }
    this.client.send(`Teleported all clients to ${this.client.x_pos}, ${this.client.y_pos}`)
  }
  kick() {
    let id = parseInt(this.args[0]);
    let target = this.world.clients.find(function(item) {
      return item.id == id
    }.bind(this))
    if (target) {
      target.ws.close();
      server.players.sendToWorld(this.world.name, `DEVKicked: ${id} (${target.ip})`, commandsPermissions[this.command])
    } else if (!id) {
      this.client.send("Usage:\n /kick [id]")
    } else if (!target) {
      this.client.send(`User with id ${id} not found.`)
    }
  }
  ao() {
    var msg = this.args.join(" ");
    if(msg) {
      server.players.sendToAll(` [${this.client.world}] [${this.client.id}] ${this.client.nick}: ${msg}`, commandsPermissions[this.command])
    } else {
      this.client.send("Usage:\n /ao [message]")
    }
  }
  whois() {
    let id = parseInt(this.args[0]);
    if(!id) id = this.client.id;
    let target = this.world.clients.find(function(item) {
      return item.id == id
    }.bind(this))
    if (target) {
        if(this.client.rank == 3){
      this.client.send(
        `Client informations:\n` +
        `-> ID: ${target.id}\n` +
        `-> Nick: ${target.nick || "Not set"}\n` +
        `-> IP: ${target.ip}\n` +
        `-> Rank: ${target.rank}\n` +
        `-> Tool: ${target.tool}\n` +
        `-> Color: R ${target.col_r} G ${target.col_g} B ${target.col_b}\n` +
        `-> X, Y: ${target.x_pos}, ${target.y_pos}\n` +
        `-> Vanish: ${target.vanish ? "Yes" : "No"}\n` +
        `-> Location: coming soon`
      );
        } else if (this.client.rank == 2){
            if(target.rank >= 2) {this.client.send("Target's rank is moderator, or admin.")} else {
            this.client.send(
        `Client informations:\n` +
        `-> ID: ${target.id}\n` +
        `-> Nick: ${target.nick || "Not set"}\n` +
        `-> Rank: ${target.rank}\n` +
        `-> Tool: ${target.tool}\n` +
        `-> Color: R ${target.col_r} G ${target.col_g} B ${target.col_b}\n` +
        `-> X, Y: ${target.x_pos}, ${target.y_pos}\n`
      );
            };
        };
    } else if (!target) {
      this.client.send(`User with id ${id} not found.`)
    };
  }
  banip() { //crazy
    let ip = this.args[0];

    if (ip) {
      let duration = Math.abs(parseInt(this.args[1]));
      if (isNaN(duration)) duration = 0;
      let durationTimeUnit = this.args[2] || "seconds";
      let reason = this.args;
      reason.shift();
      reason.shift();
      reason.shift();
      reason = reason.join(" ");
      reason = reason.length ? reason : server.config.messages.defaultBanReason;
      let realDuration = duration * 1000;
      let perm = duration === 0;

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
      server.bansManager.addBanIp(ip, reason, realDuration);
      server.players.sendToAll(`DEVBanned ip ${ip}. Reason: ${reason}`, commandsPermissions[this.command]);
      let banString = `${server.config.messages.unbanMessage}\nYou are permanently banned!\nReason: ${reason}`;
      if (!perm) {
        let banEndsAfter = server.bansManager.generateString(server.bansManager.banEndsAfter(ip));
        banString = `${server.config.messages.unbanMessage}\nYou are banned for ${banEndsAfter}\nReason: ${reason}`
      }
      server.players.getAllPlayersWithIp(ip).forEach((client) => {
        client.send(banString);
        client.ws.close();
      });
    } else {
      this.client.send("Usage:\n /banip [ip] [duration] [timeunit] [reason]");
    }
  }
  ban() { // crazy and ugly sorry
    let id = this.args[0];
    let target = this.world.clients.find(function(item) {
      return item.id == id
    }.bind(this))

    if (target) {
      if(target.rank >= 2) return;
      let ip = target.ip;
      let duration = Math.abs(parseInt(this.args[1]));
      if (isNaN(duration)) duration = 0;
      let durationTimeUnit = this.args[2] || "seconds";
      let reason = this.args;
      reason.shift();
      reason.shift();
      reason.shift();
      reason = reason.join(" ");
      reason = reason.length ? reason : server.config.messages.defaultBanReason;
      let realDuration = duration * 1000;
      let perm = duration === 0;

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
      server.bansManager.addBanIp(ip, reason, realDuration);
      server.players.sendToAll(`DEVBanned ip ${ip}. Reason: ${reason}`, commandsPermissions[this.command]);
      let banString = `${server.config.messages.unbanMessage}\nYou are banned!\nReason: ${reason}`;
      if (!perm) {
        let banEndsAfter = server.bansManager.generateString(server.bansManager.banEndsAfter(ip));
        banString = `${server.config.messages.unbanMessage}\nYou are banned for ${banEndsAfter}\nReason: ${reason}`
      }
      server.players.getAllPlayersWithIp(ip).forEach((client) => {
        client.send(banString);
        client.ws.close();
      });

    } else if (!target && id) {
      this.client.send(`User with id ${id} not found.`)
    } else {
      this.client.send("Usage:\n /ban [id] [duration] [timeunit] [reason]");
    }
  }
  unbanip() {
    let ip = this.args[0];
    if (ip) {
      server.bansManager.unBanIp(ip)
      server.players.sendToAll(`DEVUnBanned ip ${ip}`, commandsPermissions[this.command]);
    } else {
      this.client.send("Usage:\n /unbanip [ip]");
    }
  }
  kickip() {
    let ip = args[0]
    var clients = server.players.getAllPlayersWithIp(ip);
    clients.forEach(function(client) {
      client.ws.close()
    })
    server.players.sendToAll(`DEVKicked ${clients.length} clients with ip ${ip}`, commandsPermissions[this.command])
  }
  disconnect() {
    this.client.send("Disconnected");
    this.client.ws.close();
  }
  help() {
    let helpString = "Commands: "
    for (var commandName in commandsPermissions) {
      let permission = commandsPermissions[commandName];
      if (permission <= this.client.rank) {
        helpString += `${commandName}, `
      }
    }
    helpString = helpString.slice(0, helpString.length - 2)
    this.client.send(helpString)
  }
  bans() {
    var string = "Bans:\n";
    for(var i in server.bansManager.bans) {
      var ban = server.bansManager.bans[i];
      string+=`${i}: ${ban.reason}`
    }
    this.client.send(string)
  }
  tellraw() {
    var id = parseInt(this.args[0]);
    var message = this.args;
    message.shift()
    message = message.join(" ")
    var target = this.world.clients.find(function(item) {
      return item.id == id
    }.bind(this))
    if (message && target) {
      target.send(message);
      this.client.send("Message sent.")
    } else if (!target && message) {
      this.client.send(`User with id ${id} not found.`)
    } else if (!id) {
      this.client.send("Usage:\n /tellraw [id] [message]")
    }
  }
  tell() {
    let id = parseInt(this.args[0])

    let msg = this.args;
    msg.shift();
    msg = msg.join(" ");

    let target = this.world.clients.find(function(target) {
      return target.id == id;
    });

    if (target && msg) {
        if(target.id !== this.client.id){
        this.client.send(`[me -> ${target.id}] ${msg}`);
      target.send(`[${this.client.id} -> me] ${msg}`);
        telllog(msg, this.client, target);
        } else {
            this.client.send(`<span style="color: #ed2b2b;">You can't DM yourself.</span>`);
        };
    } else if (!target && msg) {
      this.client.send(`User ${id} not found.`);
    } else {
      this.client.send("Usage:\n /tell [id] [msg]");
    };
  }
  getid() {
    var nick = this.args.join(" ");
    var listOfIds = [];

    if (nick) {
      for (var i = 0; i < this.world.clients.length; i++) {
        var client = this.world.clients[i]

        if (client.nick == nick) {
          listOfIds.push(client.id);
        }
      }
      if (listOfIds.length) {
        var ids = listOfIds.join(", ")
        this.client.send(`There is total ${listOfIds.length}.\nIds: ${ids}`)
      } else {
        this.client.send("There is no ids")
      }
    } else {
      this.client.send("Usage:\n /getId [nick]")
    }
  }
  save() {
    server.manager.updateDatabase();
  }
}

module.exports = Commands;
