const path = require('path');


module.exports = {
    config: {
        name: 'Restart',
        description: 'Restart bot data.',
        usage: '[prefix]Restart',
        author: 'PrinceDev',
        role: 3,
        coolDown: 5,
        aliases: []    
    },
    
    onStart: async function({ systemData, send, api, addFont }) {
		const { loadCommands, saveData, getData } = systemData;
		
		const restartingMess = await addFont('🔄 Restarting...', 'italic');
		const { messageID } = await send(restartingMess);
		
		const cmdsPath = __dirname;
		loadCommands(null, cmdsPath);
        
        await new Promise(r => setTimeout(r, 5000));
		
		const { commandsConfig }= getData();
		const loadedCount = commandsConfig.size;
        
        const data = systemData.data;
        saveData({
            restartData: {
                restarted: true,
                triggersMirror: data.triggersMirror,
                commandsConfig: data.commandsConfig,
                specials: data.specials
            }
        });
		
		const loadedMsg = await addFont(`📦 Loaded: ${loadedCount} cmds`, 'italic');
		await api.editMessage(loadedMsg, messageID);
    }
};