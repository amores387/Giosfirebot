module.exports = {
    config: {
        name: 'CoolDown',
        description: 'Cools down command',
        usage: 'Auto',
        author: 'Prince',
        role: 'Helper'
    },
    
    onMessage: async function({ messageData, systemData, send }) {
        const { senderID, body } = messageData;
        const { prefix, commandsConfig } = systemData.getData();
        const { saveData, getSavedData } = systemData;

        let [targetCmd] = body.split(' ');
        if (!targetCmd.startsWith(prefix)) {
            return;
        };
        
        targetCmd = targetCmd.slice(prefix.length);
        const targetCmdLower = targetCmd.toLowerCase();

        if (!commandsConfig.has(targetCmdLower)) return;

        const { coolDown } = commandsConfig.get(targetCmdLower).config;
        const usagesHistory = getSavedData('usagesHistory') || {};

        if (!usagesHistory[targetCmdLower]) usagesHistory[targetCmdLower] = {};
        if (!usagesHistory[targetCmdLower][senderID]) {
            usagesHistory[targetCmdLower][senderID] = { lastUse: 0, spamCount: 0 };
        };

        const userData = usagesHistory[targetCmdLower][senderID];
        const now = Date.now();
        const secOffsetUsage = (now - userData.lastUse) / 1000;

        if (secOffsetUsage >= coolDown) {
            userData.lastUse = now;
            userData.spamCount = 0;
            
            saveData({ usagesHistory });
        }
        
        else {
            if (userData.spamCount < 3) {
                await send(`⏳️ Command on cooldown. Please try again after ${Math.round(coolDown - secOffsetUsage)} sec`);
                userData.spamCount++;
                
                saveData({ usagesHistory });
            };
            
            return 'exit';
        };
    }
};