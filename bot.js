const Discord = require('discord.js');
const client = new Discord.Client();
const auth = require('./JSONHome/auth.json');
var DB = require('./JSONHome/VoteDB.json');
var Bet = require('./JSONHome/Betting.json');
const fs = require('fs');

client.login(auth.key);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
    try {
        if (!msg.guild) return;
        if (msg.member.user.bot) return;
    } catch (err) {
        return;
    }

    try {
        const prefix = '!'
        if (msg.content.substring(0, prefix.length) === prefix) {
            const cmd = msg.content.substring(prefix.length).split(' ');

            //function
            switch (cmd[0]) {
                case 'hi':
                    msg.channel.send('Peyian!');
                    break;
                case 'b':   //vote blue
                    if (cmd.length != 2) {
                        msg.channel.send("格式不符");
                        break;
                    }
                    var pp = Number(cmd[1]);
                    if (!Number.isSafeInteger(pp) || pp < 0) {
                        msg.channel.send("格式錯誤");
                        break;
                    }
                    fs.readFile('./JSONHome/Betting.json', function (err, bet) {
                        if (err) {
                            return console.error(err);
                        }
                        var betting = bet.toString();
                        betting = JSON.parse(betting);
                        if (betting.status == false) {
                            msg.channel.send("請先開盤＝＝");
                            return;
                        }
                        usePoint(msg, msg.author.username, 1, pp);
                    })
                    break;
                case 'r':   //vote red
                    if (cmd.length != 2) {
                        msg.channel.send("格式不符");
                        break;
                    }
                    var pp = Number(cmd[1]);
                    if (!Number.isSafeInteger(pp) || pp < 0) {
                        msg.channel.send("格式錯誤");
                        break;
                    }
                    fs.readFile('./JSONHome/Betting.json', function (err, bet) {
                        if (err) {
                            return console.error(err);
                        }
                        var betting = bet.toString();
                        betting = JSON.parse(betting);
                        if (betting.status == false) {
                            msg.channel.send("請先開盤＝＝");
                            return;
                        }
                        usePoint(msg, msg.author.username, 2, pp);
                    })
                    break;
                case 'vote':    //check vote's information
                    if (cmd[1]) {
                        msg.channel.send("格式不符");
                        break;
                    }
                    fs.readFile('./JSONHome/Betting.json', function (err, bet) {
                        if (err) {
                            return console.error(err);
                        }
                        var betting = bet.toString();
                        betting = JSON.parse(betting);
                        if (betting.status == false) {
                            msg.channel.send("目前沒有賭盤喔");
                            return;
                        }
                        var br = betting.AllPoints / betting.BluePoints;
                        var bluer = br.toFixed(2);
                        bluer = Number(bluer);
                        var rr = betting.AllPoints / betting.RedPoints;
                        var redr = rr.toFixed(2);
                        redr = Number(redr);
                        const voteInfo = new Discord.MessageEmbed()
                            .setTitle(betting.title)
                            .setDescription(betting.organizer + '開啟的賭盤')
                            .setColor('#0099ff')
                            .addField("總共有", betting.AllPoints + "點")
                            .addField(betting.blue, '賠率：' + bluer, true)
                            .addField('\u200B', '\u200B', true)
                            .addField(betting.red, '賠率：' + redr, true)
                            .setTimestamp()
                        msg.channel.send(voteInfo);
                    })
                    break;
                case 'mypt':    //check points
                    if (cmd[1]) {
                        msg.channel.send("格式不符");
                        break;
                    }
                    fs.readFile('./JSONHome/VoteDB.json', function (err, db) {
                        if (err) {
                            return console.error(err);
                        }
                        var userlist = db.toString();
                        userlist = JSON.parse(userlist);
                        for (var i = 0; i < userlist.length; i++) {
                            if (userlist[i].name == msg.author.username) {
                                msg.reply("你有" + userlist[i].points);
                                break;
                            }
                        }
                    })
                    break;
                case 'start':   //start vote
                    if (cmd.length != 4) {
                        msg.channel.send("投票建立格式不符");
                        break;
                    }
                    const title = cmd[1];
                    const blue = cmd[2];
                    const red = cmd[3];
                    modifyBet(msg, true, msg.author.username, title, blue, red);
                    break;
                case 'end': //end vote
                    if (cmd.length != 2) {
                        msg.channel.send("格式不符");
                        break;
                    }
                    fs.readFile('./JSONHome/Betting.json', function (err, bet) {
                        if (err) {
                            return console.error(err);
                        }
                        var betting = bet.toString();
                        betting = JSON.parse(betting);
                        if (betting.status == false) {
                            msg.channel.send("請先開盤＝＝");
                            return;
                        }
                        if (msg.author.username != betting.organizer) {
                            msg.channel.send("你無權結束投票 嫩！");
                            return;
                        }
                        if (!cmd[1]) {
                            msg.channel.send("格式錯誤");
                            return;
                        }
                        var winner = "歐文";
                        var win_side = 0;
                        if (cmd[1] == 'b') {
                            winner = "藍藍幫獲勝！ 粉紅幫上天台了QQ";
                            win_side = 1;
                        } else if (cmd[1] == 'r') {
                            winner = "粉紅幫獲勝！ 藍藍幫跳了＝＝";
                            win_side = 2;
                        }
                        msg.channel.send("收盤囉～～ " + winner);
                        if (betting.AllPoints == 0) {
                            msg.channel.send("沒人贏得點數");
                            modifyBet(msg, false, "none", "none", "none", "none");
                            return;
                        }
                        var ratio = 1;
                        var rate;
                        if (win_side == 1) {
                            ratio = betting.AllPoints / betting.BluePoints;
                            rate = ratio.toFixed(2);
                        }
                        if (win_side == 2) {
                            ratio = betting.AllPoints / betting.RedPoints;
                            rate = ratio.toFixed(2);
                        }
                        rate = Number(rate);
                        reducePoint(msg, win_side, rate);
                        modifyBet(msg, false, "none", "none", "none", "none");
                    })
                    break;
                case 'join':    //join DB
                    if (cmd[1]) {
                        msg.channel.send("格式不符");
                        break;
                    }
                    joinDB(msg);
                    break;
                case 'help':
                    const command = new Discord.MessageEmbed()
                        .setTitle("指令集")
                        .setColor('#0099ff')
                        .setThumbnail('https://attach.setn.com/newsimages/2021/02/18/3030893-PH.jpg')
                        .addField("!join", "加入")
                        .addField("!mypt", "查詢自己的點數")
                        .addField("!start [標題] [藍方] [紅方]", "開啟賭盤")
                        .addField("!end [b/r]", "結束賭盤\n藍/紅方勝")
                        .addField("!b [下注點數]", "加入藍藍幫")
                        .addField("!r [下注點數]", "加入粉紅幫")
                        .addField("!vote", "查看賭盤狀況")
                        .setTimestamp()
                    msg.channel.send(command);
                    break;
            }
        }
    } catch (err) {
        console.log('OnMessageError', err);
    }
});

function modifyBet(tempmsg, status, organizer, title, blue, red) {
    fs.readFile('./JSONHome/Betting.json', function (err, bet) {
        if (err) {
            return console.error(err);
        }
        var betting = bet.toString();
        betting = JSON.parse(betting);
        if (status) {
            if (betting.status) {
                tempmsg.channel.send("你冷靜點");
                return;
            }
            const newVote = new Discord.MessageEmbed()
                .setTitle(title)
                .setColor('#0099ff')
                .addField(blue, '\u200B', true)
                .addField('\u200B', '\u200B', true)
                .addField(red, '\u200B', true)
                .setTimestamp()
            tempmsg.channel.send(newVote);
        }
        betting.organizer = organizer;
        betting.status = status;
        betting.title = title;
        betting.blue = blue;
        betting.red = red;
        betting.AllPoints = 0;
        betting.BluePoints = 0;
        betting.RedPoints = 0;

        var newBet = JSON.stringify(betting);
        fs.writeFile('./JSONHome/Betting.json', newBet, function (err) {
            if (err) {
                console.error(err);
            }
        })
    })
}

function usePoint(tempmsg, username, side, points) {
    fs.readFile('./JSONHome/VoteDB.json', function (err, db) {
        if (err) {
            return console.error(err);
        }
        var userlist = db.toString();
        userlist = JSON.parse(userlist);
        for (var i = 0; i < userlist.length; ++i) {
            //console.log(i);
            if (userlist[i].name == username) {
                if (userlist[i].points - points < 0) {
                    tempmsg.reply("點數不足，請課金");
                    return;
                }
                userlist[i].points = userlist[i].points - points;
                userlist[i].used_point = points;
                userlist[i].vote = side;
                break;
            }
            if (i == userlist.length - 1) {
                tempmsg.channel.send("你沒有點數 請輸入!join加入");
                return;
            }
        }
        var newdb = JSON.stringify(userlist);
        fs.writeFile('./JSONHome/VoteDB.json', newdb, function (err) {
            if (err) {
                console.error(err);
            }
        })
        if (side == 1) {
            tempmsg.channel.send(`${tempmsg.author}` + "投了" + points + "點給藍藍幫！ #相信");
        } else {
            tempmsg.channel.send(`${tempmsg.author}` + "投了" + points + "點給粉紅幫！ 定存一下");
        }
        voteBet(side, points);
    })
}

function voteBet(side, points) {
    fs.readFile('./JSONHome/Betting.json', function (err, bet) {
        if (err) {
            return console.error(err);
        }
        var betting = bet.toString();
        betting = JSON.parse(betting);

        if (side == 1) {
            betting.BluePoints = betting.BluePoints + points;
        } else {
            betting.RedPoints = betting.RedPoints + points;
        }
        betting.AllPoints = betting.BluePoints + betting.RedPoints;
        var newBet = JSON.stringify(betting);
        fs.writeFile('./JSONHome/Betting.json', newBet, function (err) {
            if (err) {
                console.error(err);
            }
        })
    })
}

function reducePoint(tempmsg, winside, ratio) {
    fs.readFile('./JSONHome/VoteDB.json', function (err, db) {
        if (err) {
            return console.error(err);
        }
        var userlist = db.toString();
        userlist = JSON.parse(userlist);

        for (var i = 0; i < userlist.length; i++) {
            if (userlist[i].vote == winside) {
                userlist[i].points = userlist[i].points + Number((userlist[i].used_point * ratio).toFixed());
                tempmsg.channel.send("恭喜" + userlist[i].name + "獲得了" + (userlist[i].used_point * ratio).toFixed());
            }
            userlist[i].vote = 0;
        }
        var newdb = JSON.stringify(userlist);
        fs.writeFile('./JSONHome/VoteDB.json', newdb, function (err) {
            if (err) {
                console.error(err);
            }
        })
    })
}

function joinDB(tempmsg) {
    fs.readFile('./JSONHome/VoteDB.json', function (err, db) {
        if (err) {
            return console.error(err);
        }
        var userlist = db.toString();
        userlist = JSON.parse(userlist);
        for (var i = 0; i < userlist.length; ++i) {
            //console.log(i);
            if (userlist[i].name == tempmsg.author.username) {
                tempmsg.channel.send("你不要再搞了");
                return;
            }
            if (i == userlist.length - 1) {
                var newUser = {
                    "name": tempmsg.author.username,
                    "points": 10000,
                    "used_point": 0,
                    "vote": 0
                }
                userlist.push(newUser);
                tempmsg.channel.send("歡迎加入");
                console.log(userlist);
                break;
            }
        }
        var newdb = JSON.stringify(userlist);
        fs.writeFile('./JSONHome/VoteDB.json', newdb, function (err) {
            if (err) {
                console.error(err);
            }
        })
    })
}