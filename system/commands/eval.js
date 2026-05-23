const util = require('util');


module.exports = {
    config: {
        name: 'Eval',
        description: 'Execute js codes',
        usage: '[prefix]eval <code>',
        author: 'Prince',
        role: 3,
        coolDown: 5,
        aliases: ['exec']
    },
    
    onStart: async function({ rawArgs, messageData, api, systemData, send, unsend, react, botID, origLog, addFont }) {
        let { body } = messageData;
        body = body.replace(/#(eval|exec)/i, '');
        const code = body.trim();

        if (!code) {
            send('⚠️ Enter code to execute.');
            return;
        };

        const logs = [];
        const realLog = origLog.log;

        console.log = (...args) => {
            for (let arg of args) {
                if (typeof arg === 'object' && arg!== null) {
                    arg = util.inspect(arg, {
                        depth: 2,
                        indent: 4,
                        colors: false,
                        compact: false
                    });
                };
                
                logs.push(String(arg));
                realLog(arg);
            };
        };

        const ev = await addFont('EVAL', 'bold');
        const outputBase = `💻 ${ev} 💻\n`;
        let result;

        try {
            const executer = `(async () => { ${code} })()`;
            result = await eval(executer);

            if (result === undefined) result = 'NO OUTPUT';

            let output = '';

            if (typeof result === 'object' && result!== null) {
                result = util.inspect(result, {
                    depth: 2,
                    indent: 4,
                    colors: false,
                    compact: false
                });
            }
            
            else {
                result = String(result);
            };

            if (result.length > 3000) result = result.slice(0, 3000) + '\n\n[TRUNCATED]';

            output += await addFont('✅ OUTPUT:\n', 'bold') + result;

            if (logs.length) {
                output += await addFont('\n\n📋 LOGS:\n', 'bold') + logs.join('\n');
            };

            await send(outputBase + output);
        }
        
        catch (err) {
            await send(`${outputBase}${await addFont('Error', 'bold')}: ${err.stack}`);
        }
        
        finally {
            console.log = realLog;
        };
    }
};