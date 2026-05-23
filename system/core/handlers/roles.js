module.exports = {
    config: {
        name: 'Roles',
        description: 'Handles commands roles',
        usage: 'Auto',
        author: 'PrinceDev',
		role: 'Helper'
    },
    
    onMessage: async function({ systemData, messageData, api, send }) {
		const { getData, saveData, getSavedData } = systemData;
        const { prefix, commandsConfig, aliases, admins } = getData();
        
        const { body, senderID, threadID } = messageData;
		const { getThreadInfo } = api;
        
        let [cmd] = body.toLowerCase().split(' ');
        if (!cmd.startsWith(prefix)) {
            return;
        };
        
        cmd = cmd.slice(prefix.length);
		if (!(cmd in commandsConfig)) {
			return;
		};
		
		const config = commandsConfig[cmd].config;
		
		let msg;
		switch (config.role) {
			case 3:
				if (!admins.includes(senderID)) {
					msg = '❌️ | You dont have permission to use this command.';
				};
				
				break;
		
			case 2:
				const threadAdmins = getSavedData('threadAdmins') || {};
				
				let adminIDs = threadAdmins[threadID];
				if (!adminIDs) {
					const threadInfo = await getThreadInfo(threadID);
					adminIDs = threadInfo.adminIDs.map(obj => obj.id);
					
					threadAdmins[threadID] = adminIDs;
					
					saveData({
						threadAdmins
					});
				};	
		
				if (!admins.includes(senderID) && !adminIDs.includes(senderID)) {
					msg = '❌️ | Only admins of chat box and bot admins can use this.';
				};
				
				break;
				
			default:
				break;	
		};
		
		if (msg) {
			await send(msg);
			return 'exit';
		};
    },
    
    onEvent: async function({ event, systemData }) {
        const { saveData, getSavedData } = systemData;
        const { threadID, logMessageType, logMessageData } = event;
        
        if (logMessageType !== 'log:thread-admins') {
            return;
        };
        
        const { admin_event, target_id } = logMessageData;
        
        if (admin_event === 'add_admin') {
            let threadAdmins = getSavedData('threadAdmins') || {};
            
            if (!threadAdmins[threadID]) {
                threadAdmins[threadID] = [];
            };
            
            threadAdmins[threadID].push(target_id);
            saveData({ threadAdmins });
        };
    }
};