const FS = require('fs');
const Handlebars = require('handlebars');
const Keypair = require('keypair');
const Forge = require('node-forge');
const Readline = require('readline');
const Util = require('util');
const Async = require('async');
const ShortId = require('shortid');

let userName = process.env.USER || process.env.USERNAME || 'root';
let outputFolderName = ShortId.generate();

let questions = [
    {
        question: Util.format(
                'What SSH user name would you like to use%s? ',
                !!userName ? ` [${userName}]` : ''
            ),
        callback: ans => userName = ans || userName
    }
];

readInputs(questions, () => {
    // read in the template file
    FS.readFile('Dockerfile.template', 'utf8', (err, templateText) => {
        if(!!err) {
            console.error(`Couldn't read Dockerfile.template: ${err.toString()}`);
        } else {
            // compile the template
            const template = Handlebars.compile(templateText);

            // build the keypair
            const pair = Keypair();

            // create output folder
            

            // save the private key
            FS.writeFile

            const publicKey = Forge.pki.publicKeyFromPem(pair.public);
            const context = {
                publicKey: Forge.ssh.publicKeyToOpenSSH(publicKey, userName)
            };
            
            console.log(template(context));
        }
    });
});

function readInputs(questions, callback) {
    const rl = Readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });


    let tasks = questions.map(q => cb => {
        rl.question(q.question, answer => {
            if(!!(q.callback)) {
                q.callback(answer);
            }
            cb();
        });
    });

    Async.series(tasks, (err, res) => {
        rl.close();
        callback(err, res);
    });
}