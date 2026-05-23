module.exports = {
    config: {
        name: 'Aliases',
        description: 'Handle different aliases',
        usage: 'Auto',
        author: 'Prince',
        role: 'Helper'     
    },
    
    onMessage: async function({ systemData, messageData }) {
        const { saveData, getData } = systemData;
        let { prefix, commandsConfig, aliases } = getData();
        const { body } = messageData;
        
        let [target] = body.toLowerCase().split(' ');
        let targetCmd = target;
        
        if (!target.startsWith(prefix)) {
            prefix = '';
        }
        
        else {
            targetCmd = targetCmd.slice(prefix.length);
        };
        
        const aliased = aliases.get(targetCmd);
        targetCmd = aliased || targetCmd;
        
        const replacement = body.startsWith(target) ? body.replace(target, `${prefix}${targetCmd}`) : body;
        
        saveData({
            aliases: {
                body: replacement,
                targetCmd: aliased
            }
        });
    }
};