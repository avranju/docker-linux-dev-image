const FS = require('fs');
const Path = require('path');
const Handlebars = require('handlebars');
const Keypair = require('keypair');
const Forge = require('node-forge');
const Readline = require('readline');
const Util = require('util');
const Async = require('async');
const ShortId = require('shortid');

let userName = 'root';
let outputFolderName = Path.join(__dirname, ShortId.generate());

let questions = [
    {
        question: Util.format(
                'What SSH user name would you like to use%s? ',
                !!userName ? ` [${userName}]` : ''
            ),
        callback: ans => userName = ans || userName
    }
];

let templateText = '';
let keyPair = null;
let sshKey = null;

Async.waterfall([
    cb => {
        readInputs(questions, cb);
    },

    // read in the template file
    (res, cb) => {
        console.log('[*] Reading Dockerfile template.');
        FS.readFile('Dockerfile.template', 'utf8', cb);
    },

    // create output folder
    (template, cb) => {
        console.log(`[*] Creating output folder ${outputFolderName}.`);
        templateText = template;
        FS.mkdir(outputFolderName, cb);
    },

    cb => {
        // build the keypair
        console.log(`[*] Generating new keypair.`);
        keyPair = Keypair();

        // save the private key
        console.log(`[*] Saving private key file.`);
        FS.writeFile(
            Path.join(outputFolderName, 'id_rsa'),
            keyPair.private,
            { encoding: 'utf8' },
            cb
        );
    },

    cb => {
        console.log(`[*] Saving public key file.`);
        const publicKey = Forge.pki.publicKeyFromPem(keyPair.public);
        sshKey = Forge.ssh.publicKeyToOpenSSH(publicKey, userName);

        FS.writeFile(
            Path.join(outputFolderName, 'id_rsa.pub'),
            sshKey,
            { encoding: 'utf8' },
            cb
        );
    },

    cb => {
        // compile the template
        const template = Handlebars.compile(templateText);
        const dockerFile = template({
            publicKey: sshKey
        });

        console.log(`[*] Generating Dockerfile.`);
        FS.writeFile(
            Path.join(outputFolderName, 'Dockerfile'),
            dockerFile,
            { encoding: 'utf8' },
            cb
        );
    }
], (err) => {
    if(!!err) {
        console.error(`Couldn't read Dockerfile.template: ${err.toString()}`);
    } else {
        console.log(
`
> The SSH keys and Dockerfile are in the folder ${outputFolderName}.
`
        );
    }
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