const fs = require('fs'); const path = require('path');


module.exports = {
    config: {
        name: 'botAdd',
        description: 'Send message to thread when added',
        usage: 'Auto',
        author: 'Prince',
        role: 0,
        coolDown: 5,
        aliases: []
    },

    onEvent: async function({ event, send, botID, systemData, addFont, api, unsend }) {
        const { logMessageType, logMessageData, threadID } = event;
        const { prefix } = systemData.getData();

        if (logMessageType !== 'log:subscribe') return;
        if (!logMessageData.addedParticipants.some(user => user.userFbId === botID)) return;
        
        const { messageID } = await send('🚀 NΣXUS - Initializing...', threadID, null);
        await new Promise(r => setTimeout(r, 5000));

        const msg = `Hello, everyone! ✨
Thank you so much for adding me to this group. I'm excited to be here and assist you all!

${await addFont('SYSTEM', 'bold')}: NΣXUS
═════════════
💻 ${await addFont('Name:', 'bold')} ${(await api.getUserInfo(botID)).name}
⌨️ ${await addFont('Prefix:', 'bold')} ${prefix}
🛠️ ${await addFont('Developer:', 'bold')} Prince Har
═════════════
I'm a bot designed to help with various tasks.
To get started, please use the command #help
to see a list of my available features.
I look forward to working with you!

NΣXUS - Developed by Prince Har
`;
        
        const imgPath = path.join(__dirname, , '..', '..', '..', 'images/botAdd.jpg');
		const imageStream = fs.createReadStream(imgPath);
        
        await unsend(messageID);
        
        await send({
			attachment: imageStream,
			body: msg
		}, threadID, null);
    }
};
