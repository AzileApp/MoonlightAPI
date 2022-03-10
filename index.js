// Wall Post Filter

const mysql = require('mysql');
const noblox = require('noblox.js');
const chalk = require('chalk');
const axios = require('axios');
const fs = require('fs');

console.log(`${chalk.greenBright('[APP] Filter started.')}`);

process.on('unhandledRejection', (reason, promise) => {
    console.log(reason.stack || reason)
})

doTaskSet();

setInterval(() => {
    doTaskSet();
}, 30000);

async function doTaskSet() {
    const con = mysql.createConnection({
        database: "azileapp_moonlight",
        host: "91.210.103.4",
        user: "azileapp_admin",
        password: "Azilesunlight?"
    });

    con.connect(function(err) {
        if (err) throw err;
        console.log(`${chalk.yellowBright('[DATABASE] Database connected & synced.')}`);
    });

    con.query(`SELECT * FROM walls`, function (err, result) {
        if (err) throw err;
        
        result.forEach(async row => {
            try {
                const user = await noblox.setCookie(row.cookie);
                const wallPosts = await noblox.getWall(row.group_id);

                console.log(`${chalk.blueBright(`[COOKIE] Logged in as ${user.UserName} | ${user.UserID}`)}`)
            
                wallPosts.data.forEach(async post => {
                    await axios.get(`https://azile.app/blacklist.json`).then(data => {
                        data = data.data;
                        words = data.blacklist;

                        words.forEach(word => {
                            if(post.body.includes(word)){
                                noblox.deleteWallPost(row.group_id, post.id)
                                console.log(`${chalk.redBright(`[FLAG] A post by ${post.poster.user.username} has been deleted for containing the word ${word}.`)}`)
                            }
                        })
                    })
                })
            } catch (err) {
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
app.get('/', function (request, reply) {
    doTaskSet();
    reply.send({
        Endpoint: 'Moonlight',
        Developer: 'Jonax'
    })
})

app.listen(80, '0.0.0.0', (err, address) => {
    if (err) { console.error(err); }
    console.log(`${chalk.greenBright('[APP] API started.')}`);
})