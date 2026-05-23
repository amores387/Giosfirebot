const path = require('path');


module.exports = {
    config: {
        name: 'ReelDownload',
        description: 'Download reels',
        usage: '[prefix]ReelDownload <url>',
        author: 'PrinceDev',
        role: 3,
        coolDown: 5,
        aliases: ['reelDl']    
    },
    
    onStart: async function({ send, unsend, addFont, rawArgs, systemData }) {
        const { serverFunc } = systemData;
        
        const urls = rawArgs;
        if (!urls.length) {
            await send('️⚠️ Enter url to download.');
            return;
        };
        
        const { messageID } = await send(await addFont('⬇️ Downloading facebook reel...', 'serif'));
        
        for (const url of urls) {
            const cleanUrl = url.trim().endsWith('/') ? url.trim().slice(0, -1) : url.trim();
            const reelRegex = /^https?:\/\/(www\.)?facebook\.com\/(share\/r\/[a-zA-Z0-9]+|reel\/\d+)$/;
        
            if (!reelRegex.test(cleanUrl)) return;
        
            const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
            const vidPath = path.join(__dirname, '..', '..', `videos/downloads/${timestamp}.mp4`);
            const dlRes = await serverFunc(null, null, { url: cleanUrl, path: vidPath }, null, 'reel/download');
            
            if (!dlRes.success) {
                await send(`Download error: ${dlRes.msg}`);
                continue;
            };
        };    
        
        await unsend(messageID);
        await send('✅ Downloaded successfully');
    }
};