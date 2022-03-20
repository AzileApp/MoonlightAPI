// Wall Post Filter

const mysql = require('mysql');
const noblox = require('noblox.js');
const chalk = require('chalk');
const axios = require('axios');
const fs = require('fs');
const fetch = require('node-fetch');
const HttpsProxyAgent = require("https-proxy-agent")
const HttpsAgent = new HttpsProxyAgent({host: "52.20.43.222", port: "31112", auth: "stiqnxo8:GJEuVAX23ux7MBMQ"})

console.log(`${chalk.greenBright('[APP] Filter started.')}`);

process.on('unhandledRejection', (reason, promise) => {
    console.log(reason.stack || reason)
})

let con = mysql.createConnection({
        database: "azileapp_moonlight",
        host: "91.210.103.4",
        user: "azileapp_admin",
        password: "Azilesunlight?"
    });

    con.connect(function(err) {
        if (err) throw err;
        console.log(`${chalk.yellowBright('[DATABASE] Database connected & synced.')}`);
    });

doTaskSet();

setInterval(() => {
    doTaskSet();
}, 10000);

async function doTaskSet() {

    con.query(`SELECT * FROM walls`, function (err, result) {
        if (err) throw err;
        
        result.forEach(async row => {
            try {
                
                const fetchPosts = await fetch(`https://groups.roblox.com/v2/groups/${row.group_id}/wall/posts`, {agent: HttpsAgent});
                const wallPosts = await fetchPosts.json();
                if(fetchPosts.status === 403) {
                    doTaskSet();
                }

                console.log(wallPosts)

                wallPosts.data.forEach(async post => {
                    await axios.get(`https://azile.app/blacklist.json`).then(data => {
                        data = data.data;
                        words = data.blacklist;

                        words.forEach(async word => {
                            if(post.body.toLowerCase().includes(word.toLowerCase())){
                                const deletePost1 = await fetch(`https://groups.roblox.com/v1/groups/${row.group_id}/wall/posts/${post.id}`, {agent: HttpsAgent, method: 'DELETE', headers: {
                                    'cookie': `.ROBLOSECURITY=${row.cookie};`
                                }})
                                const deletePost2 = await fetch(`https://groups.roblox.com/v1/groups/${row.group_id}/wall/posts/${post.id}`, {agent: HttpsAgent, method: 'DELETE', headers: {
                                    'cookie': `.ROBLOSECURITY=${row.cookie};`,
                                    'x-csrf-token': `${deletePost1.headers.get('x-csrf-token')}`
                                }})
                                console.log(`${chalk.redBright(`[FLAG] A post by ${post.poster.user.username} has been deleted for containing the word ${word}.`)}`)
                            }
                        })
                    })
                })
            } catch (err) {
                console.log(err)
                console.error(`\n\n\nAn error occured whilst authenticating.\n\n\n`);
            }
        })
    });
}


// Fastify Web API

const fastify = require('fastify');
const app = fastify();

app.get('/check', function (request, reply) {
    doTaskSet();
    reply.send({
        response: true,
        message: 'Forced a filter check, all offending comments should now be removed.'
    })
})

app.listen(80, '0.0.0.0', function (err, address) {
    if (err) { console.error(err); process.exit(1); }
    console.log(`${chalk.greenBright('[APP] API started.')}`);
})
