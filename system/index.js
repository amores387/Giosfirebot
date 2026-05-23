const login = require('stfca');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk');
const util = require('util');


const Queue = require('./core/queue');
const nexus = require('./core/nexus');


const { addFont, fontMap, origLog } = nexus;
const system = nexus.systemData;


origLog.log(chalk.green('\n\n[BOT]'));
origLog.info(util.inspect(system.getData(), { depth: 2, indent: 4 }), '\n');


function setupData(defData, msgType) {
    const defaultData = { ...defData };
    const messageData = { ...defaultData.messageData };
    
    if (['event', 'typ'].includes(msgType)) {
        delete defaultData.messageData;
        defaultData.event = messageData;
    }
    
    else if (msgType === 'message_reaction') {
        delete defaultData.messageData;
        defaultData.reactData = messageData;
    }
    
    return defaultData;
};


async function runFunc(runner, runnerData) {
    try {
        if (runner.constructor.name === 'AsyncFunction') {
            return await runner(runnerData);
        } 
                
        else {
            return runner(runnerData);
        };
    } 
    
    catch (err) {
        origLog.log(`[ RUN ]: ${err.stack}`);
    };
};


function run(appstatePath = null, systemData = system) {
    try {
        const cmdsQueue = new Queue();
        const eventsQueue = new Queue();
        
        const { getSavedData, saveData, getData, serverFunc, data } = systemData;
        
        let {
            triggersMirror, specials,
            commandsConfig
        } = data;
        
        let {
            onMessages, onEvents, onReacts
        } = specials;
        
        origLog.log(chalk.green('\n[SYSTEM]'));
        origLog.info(util.inspect(system, { depth: 1, indent: 4 }), '\n');

		systemData.run = run;
		
		if (!appstatePath) {
        	appstatePath = path.join(__dirname, 'appstates/main-bot.json');
		};	
		
		login({ appState: JSON.parse(fs.readFileSync(appstatePath, 'utf8')) }, async (err, api) => {
            if (err) return console.error('Login error: ', err);
            
            const botID = await api.getCurrentUserID();
            
            api.setOptions({
                listenEvents: true,
                selfListen: true,
                listenTyping: true,
                updatePresence: true
            });
            
            const sendFunc = async (msg, targetThreadID, replyToId, isSingleUser, font, callback) => {
			    if (typeof msg === "string") msg = { body: msg };
					
			    msg.body = String(msg?.body ?? "");
                targetThreadID = String(targetThreadID);
			    const reply = replyToId ? String(replyToId) : null;
                
                if (font) {
				    msg.body = await addFont(msg?.body);
                };
                
                await new Promise(r => setTimeout(r, 500));
                return await api.sendMessage(msg, targetThreadID, callback, reply, isSingleUser);
			};

            const unsendFunc = async (messageID) => await api.unsendMessage(messageID);
            const reactFunc = async (reaction, target) => await api.setMessageReaction(reaction, target);
			
			const realGetUserInfo = api.getUserInfo;
			api.getUserInfo = async (id) => {
                if (!id) return;
                
				return (await realGetUserInfo(id))[id];
			};
            
            const botName = (await api.getUserInfo(await api.getCurrentUserID())).name;
            origLog.log(`Logged as: ${botName}`);
            
            cmdsQueue.setHandler(async (_, data) => {
                let { getSavedData, targetCommand, defaultData, commandsConfig, runFunc, prefix } = data;
                const { send } = defaultData;

                const fromSavedTargetCmd = getSavedData('aliases').targetCmd;
                targetCommand = fromSavedTargetCmd || targetCommand.slice(prefix.length);
                
                console.log(targetCommand )

                if (!commandsConfig.has(targetCommand)) {
                    await send(await addFont(`❎️ | The command you are using does not exist, type ${prefix}help to see all available commands`, 'serif'));
                    return;
                };

                const onStart = commandsConfig.get(targetCommand).onStart;
                await runFunc(onStart, defaultData);
            });
           
            eventsQueue.setHandler(async (_, data) => {
                const { runners, runnerData, runFunc, msgType, getSavedData } = data;
                let aliasesGiven = false;

                for (const runner of runners) {
                    const result = await runFunc(runner, runnerData);
                    if (result === 'exit') return 'exit';

                    if (!aliasesGiven && msgType === 'onMessage') {
                        const { body } = getSavedData('aliases');
                        
                        runnerData.messageData.body = body;
                        aliasesGiven = true;
                    };
                };
            });
			
            api.listenMqtt(async (err, event) => {
                const restartData = getSavedData('restartData');
                
                if (restartData?.restarted) {
                    ({
                        triggersMirror, specials,
                        commandsConfig 
                    } = restartData);
                        
                    ({
                        onMessages, onEvents, onReacts
                    } = specials);
                    
                    saveData({ restartData: null });
                };
                
                const message = event;
                const { senderID } = message;
                
                if (senderID === botID) {
                    origLog.log(chalk.green('\n\n[BOT MESSAGE]'));
                    origLog.info(util.inspect(message, { depth: 2, indent: 4 }), '\n');
                    
                    return;
                };

                const messageData = message;

                const botData = systemData.getData();
                const { prefix, admins } = botData;
				
                const text = typeof message === 'string' ? message : (message?.body ?? '');
                const messageContent = text.split(' ');
                const rawArgs = messageContent.slice(1);
                    
                const msgType = messageData.type;
                const specialKey = triggersMirror.get(msgType);
                
                if (!specialKey) return;
                
                const { threadID, messageID } = messageData;
                
                const send = async (msg, targetThreadID = threadID, replyToId = messageID ?? null, isSingleUser = false, font = false, callback = () => {}) => {
                    return await sendFunc(msg, targetThreadID, replyToId, isSingleUser, font, callback);
                };
                
                const unsend = async (messageID) => {
                    await unsendFunc(messageID);
                };
                
                const react = async (reaction, target = messageID) => {
                    await reactFunc(reaction, target);
                };
                        
                const defaultData = {
                    rawArgs,
                    messageData,
                    send,
                    unsend,
                    react,
                    systemData,
                    api,
                    origLog,
                    botID,
                    addFont,
                    fontMap
                };
                
                const runnerData = setupData(defaultData, msgType);
                
                const special = specials.get(specialKey);
                const result = await eventsQueue.addQueue(null, {
                    runners: special.runners,
                    runnerData,
                    runFunc,
                    msgType,
                    getSavedData
                });
                
                if (result === 'exit') return;

                if (!(messageContent.length)) {
                    return;
                };
                
                let targetCommand = messageContent[0].toLowerCase();
                if (!(targetCommand.startsWith(prefix))) {
                    return;
                };
                
                cmdsQueue.addQueue(null, {
                    getSavedData,
                    targetCommand,
                    defaultData,
                    commandsConfig,
                    runFunc,
                    prefix
                });
            });
        });
    } 
    
    catch (err) {
        try {
            origLog.log(`\n${chalk.red('[LOG]')}\n${err}`);
        } 
        
        catch (err) {};
    };
};


run();