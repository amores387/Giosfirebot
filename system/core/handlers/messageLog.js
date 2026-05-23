const chalk = require('chalk');
const util = require('util');

module.exports = {
    config: {
        name: 'MessageLogger',
        description: 'Logs new messages (data)',
        usage: 'Auto',
        author: 'Prince',
        role: 'Helper'        
    },
    
    onMessage: async function({ messageData, origLog, api }) {
		const { senderID, messageReply } = messageData;
		
		messageData.name = (await api.getUserInfo(senderID)).name;
        
        const d = {
            ...messageData,
            participantIDs: [],
            
            messageReply: {
                ...(messageData.messageReply || {}),
                participantIDs: []
            }
        }
        
        const formattedData = util.inspect(d, { depth: 2, indent: 4 });
        
        origLog.log(chalk.green('\n\n[MESSAGE]'));
        origLog.info(formattedData, '\n');
    }    
};