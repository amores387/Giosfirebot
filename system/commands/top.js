const { Readable } = require('stream');


module.exports = {
    config: {
        name: 'Top',
        description: 'Show top users by total wealth',
        usage: '[prefix]top <count>',
        author: 'PrinceDev',
        role: 0,
        coolDown: 5,
        aliases: ['highest', 'leader-board']
    },
    
    onStart: async function({ api, rawArgs, send, systemData, addFont, messageData }) {
        const { serverFunc } = systemData;
        const { threadID } = messageData;

        let count = Number(rawArgs[0]) || 10;
        if (count > 500) count = 500;
        if (!Number.isFinite(count) || count <= 0) {
            await send(`⚠️ ${await addFont('Enter 1-500', 'bold')}`);
            return;
        };

        const result = await serverFunc('users', 'GET', {
            columns: ['name', 'bal', 'bank'],
            fetch_state: 'ALL'
        });

        if (!result.success) {
            await send(`❌ ${await addFont('DB Error:', 'bold')} ${result.error}`);
            return;
        };

        const pairs = result.data.map(row => [row[1], row[2]]);
        
        const calcRes = await serverFunc(null, null, {
            pairs: pairs,
            op: 'add'
        }, null, 'calculate/multi');

        if (!calcRes.success) {
            await send(`❌ ${await addFont('Calc Error:', 'bold')} ${calcRes.msg}`);
            return;
        };

        const totals = calcRes.results;
        const users = result.data.map((row, i) => [row[0], row[1], row[2], totals[i]]);

        const sortRes = await serverFunc(null, null, {
            array: users,
            key: 3,
            reversed: true
        }, null, 'sort');

        if (!sortRes.success) {
            await send(`❌ ${await addFont('Sort Error:', 'bold')} ${sortRes.msg}`);
            return;
        };

        const topUsers = sortRes.result.slice(0, count);
        count = topUsers.length;

        if (!topUsers.length) {
            const noTop = await addFont('TOP RICHEST', 'bold');
            await send(`🏆 ${noTop}\n— No top users`);
            
            return;
        };

        let topBody = `🏆 ${await addFont(`TOP ${count} RICHEST`, 'bold')}`;

        for (let i = 0; i < topUsers.length; i++) {
            const [name, bal, bank, total] = topUsers[i];
            const rank = await addFont(`${i + 1}`, 'bold');
            const nameLabel = await addFont('Name:', 'serif');
            const balLabel = await addFont('Bal:', 'serif');
            const bankLabel = await addFont('Bank:', 'serif');
            const totalLabel = await addFont('Total:', 'serif');

            topBody += `\n━━━━━━ ${rank} ━━━━━━━\n`;
            topBody += `🏷 ${nameLabel} ${name}\n`;
            topBody += `💵 ${balLabel} $${bal}\n`;
            topBody += `🏦 ${bankLabel} $${bank}\n`;
            topBody += `💰 ${totalLabel} $${total}\n`;
        };

        if (topBody.length > 1800) {
            const stream = Readable.from(Buffer.from(topBody, 'utf8'));
            const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
            
            stream.path = `nexus-top-${count}-${timestamp}.txt`;
            await api.sendMessage({
                body: await addFont('Top list too long, sent as file', 'bold'),
                attachment: stream
            }, threadID, null);
            return;
        };

        await send(topBody);
    }
};