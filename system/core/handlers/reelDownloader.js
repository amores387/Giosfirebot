const fs = require('fs');
const path = require('path');


module.exports = {
    config: {
        name: 'ReelDownloader',
        description: 'Auto download reels',
        usage: 'Auto',
        author: 'PrinceDev',
        role: 'Helper',
    },
    
    onMessage: async function({ send, unsend, messageData, systemData, origLog, addFont }) {
        const { body } = messageData;
        const { serverFunc } = systemData;
        
        if (!body) return;
        
        const cleanBody = body.trim().endsWith('/') ? body.trim().slice(0, -1) : body.trim();
        const reelRegex = /^https?:\/\/(www\.)?facebook\.com\/(share\/r\/[a-zA-Z0-9]+|reel\/\d+)$/;
        
        if (!reelRegex.test(cleanBody)) return;
        
        const vidPath = path.join(__dirname, '..', '..', `videos/reel_${Date.now()}.mp4`);
        
        const { messageID } = await send(await addFont('⬇️ Downloading facebook video...', 'serif'));
        
        const dlRes = await serverFunc(null, null, { url: cleanBody, path: vidPath }, null, 'reel/download');
        await unsend(messageID);
        
        if (!dlRes.success) {
            await send(`Download error: ${dlRes.msg}`);
            return;
        };
        
        const stream = fs.createReadStream(vidPath);
        await send({ body: await addFont('📽 Video', 'serif'), attachment: stream });
        
        const rmRes = await serverFunc(null, null, { path: vidPath }, null, 'reel/delete');
        if (!rmRes.success) {
            origLog.log(`Delete error: ${rmRes.msg}`);
        };
    }
};