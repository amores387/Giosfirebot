const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const serverFunc = require('./serverHandler');


const origLog = {
    log: console.log,
    info: console.info,
    error: console.error,
    warn: console.warn
};


const fontMap = new Map([
    ['bold', { upper: [...'𝗔𝗕𝗖𝗗𝗘𝗙𝗚𝗛𝗜𝗝𝗞𝗟𝗠𝗡𝗢𝗣𝗤𝗥𝗦𝗧𝗨𝗩𝗪𝗫𝗬𝗭'], lower: [...'𝗮𝗯𝗰𝗱𝗲𝗳𝗴𝗵𝗶𝗷𝗸𝗹𝗺𝗻𝗼𝗽𝗾𝗿𝘀𝘁𝘂𝘃𝘄𝘅𝘆𝘇'], number: [...'𝟬𝟭𝟮𝟯𝟰𝟱𝟲𝟳𝟴𝟵'] }],
    ['italic', { upper: [...'𝘈𝘉𝘊𝘋𝘌𝘍𝘎𝘏𝘐𝘑𝘒𝘓𝘔𝘕𝘖𝘗𝘘𝘙𝘚𝘛𝘜𝘝𝘞𝘟𝘠𝘡'], lower: [...'𝘢𝘣𝘤𝘥𝘦𝘧𝘨𝘩𝘪𝘫𝘬𝘭𝘮𝘯𝘰𝘱𝘲𝘳𝘴𝘵𝘶𝘷𝘸𝘹𝘺𝘻'], number: [...'0123456789'] }],
    ['serif', { upper: [...'𝐀𝐁𝐂𝐃𝐄𝐅𝐆𝐇𝐈𝐉𝐊𝐋𝐌𝐍𝐎𝐏𝐐𝐑𝐒𝐓𝐔𝐕𝐖𝐗𝐘𝐙'], lower: [...'𝐚𝐛𝐜𝐝𝐞𝐟𝐠𝐡𝐢𝐣𝐤𝐥𝐦𝐧𝐨𝐩𝐪𝐫𝐬𝐭𝐮𝐯𝐰𝐱𝐲𝐳'], number: [...'𝟎𝟏𝟐𝟑𝟒𝟓𝟔𝟕𝟖𝟗'] }],
    ['script', { upper: [...'𝒜𝐵𝒞𝒟𝐸𝐹𝒢𝐻𝐼𝒥𝒦𝐿𝑀𝒩𝒪𝒫𝒬𝑅𝒮𝒯𝒰𝒱𝒲𝒳𝒴𝒵'], lower: [...'𝒶𝒷𝒸𝒹𝑒𝒻𝑔𝒽𝒾𝒿𝓀𝓁𝓂𝓃𝑜𝓅𝓆𝓇𝓈𝓉𝓊𝓋𝓌𝓍𝓎𝓏'], number: [...'0123456789'] }],
    ['typewriter', { upper: [...'𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉'], lower: [...'𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣'], number: [...'𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿'] }],
    ['fraktur', { upper: [...'𝔄𝔅ℭ𝔇𝔈𝔉𝔊ℌℑ𝔍𝔎𝔏𝔐𝔑𝔒𝔓𝔔ℜ𝔖𝔗𝔘𝔙𝔚𝔛𝔜ℨ'], lower: [...'𝔞𝔟𝔠𝔡𝔢𝔣𝔤𝔥𝔦𝔧𝔨𝔩𝔪𝔫𝔬𝔭𝔮𝔯𝔰𝔱𝔲𝔳𝔴𝔵𝔶𝔷'], number: [...'0123456789'] }],
    ['smallcaps', { upper: [...'ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ'], lower: [...'ᴀʙᴄᴅᴇғɢʜɪᴊᴋʟᴍɴᴏᴘǫʀsᴛᴜᴠᴡxʏᴢ'], number: [...'₀₁₂₃₄₅₆₇₈₉'] }],
    ['double-struck', { upper: [...'𝔸𝔹ℂ𝔻𝔼𝔽𝔾ℍ𝕀𝕁𝕂𝕃𝕄ℕ𝕆ℙℚℝ𝕊𝕋𝕌𝕍𝕎𝕏𝕐ℤ'], lower: [...'𝕒𝕓𝕔𝕕𝕖𝕗𝕘𝕙𝕚𝕛𝕜𝕝𝕞𝕟𝕠𝕡𝕢𝕣𝕤𝕥𝕦𝕧𝕨𝕩𝕪𝕫'], number: [...'𝟘𝟙𝟚𝟛𝟜𝟝𝟞𝟟𝟠𝟡'] }],
    ['widespace', { upper: [...'ＡＢＣＤＥＦＧＨＩＪＫＬＭＮＯＰＱＲＳＴＵＶＷＸＹＺ'], lower: [...'ａｂｃｄｅｆｇｈｉｊｋｌｍｎｏｐｑｒｓｔｕｖｗｘｙｚ'], number: [...'０１２３４５６７８９'] }],
    ['default', { upper: [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'], lower: [...'abcdefghijklmnopqrstuvwxyz'], number: [...'0123456789'] }]
]);


class SystemCore {
    constructor(prefix, admins, cmdsPerPage) {
		this.SystemCore = SystemCore;
        this.data = {
            cmdsPerPage: cmdsPerPage || 10,
            prefix: prefix || '#',
            admins: admins || ['61552725337484', '100093617270335']
        };
		
		this.getData = this.getData.bind(this);
		this.getSavedData = this.getSavedData.bind(this);
		this.saveData = this.saveData.bind(this);
		this.loadCommands = this.loadCommands.bind(this);
		
        this.savedData = new Map();
		
        this.helpers = {
            calculate: this.calculate.bind(this),
            compare: this.compare.bind(this),
            validateBet: this.validateBet.bind(this),
            getAmount: this.getAmount.bind(this)
        };
        this.serverFunc = serverFunc;

        this.loadCommands(null, path.join(__dirname, '..', 'commands'));
    };

    getData() {
        return this.data;
    };

    getSavedData(key = null) {
        if (key) {
            return this.savedData.get(key);
        };
        
        return this.savedData
    };

    saveData(newData) {
        for (const [key, value] of Object.entries(newData)) {
            this.savedData.set(key, value);
        };
    };

    getAmount(arg, userData, mode = 'bal') {
        if (arg.toLowerCase().trim() === 'all') {
            const allValue = mode === 'bank'? userData.bank : userData.bal;
            return allValue;
        };
		
        return arg;
    };

    validateCommand(command, fileName) {
        const hasOnStart = typeof command.onStart === 'function';
        if (!hasOnStart) {
            return { valid: true, hasOnStart: false, errors: [], warnings: [] };
        };
		
        const requiredFields = ['name', 'usage', 'description', 'coolDown', 'role', 'author', 'aliases'];
        const validRoles = [0, 1, 2, 3];
        let errors = [];
        let warnings = [];
		
        if (!command.config) {
            return { valid: false, hasOnStart: true, errors: [`Missing 'config' object in ${fileName}`], warnings: [] };
        };
		
        const config = command.config;
        for (const field of requiredFields) {
            if (config[field] === undefined || config[field] === null || config[field] === '') {
                errors.push(`Missing or empty required field: '${field}'`);
            };
        };
		
        if (config.name && typeof config.name!== 'string') {
            errors.push(`Invalid 'name': must be string, got ${typeof config.name}`);
        };
		
        if (config.usage && typeof config.usage!== 'string') {
            errors.push(`Invalid 'usage': must be string, got ${typeof config.usage}`);
        };
		
        if (config.description && typeof config.description!== 'string') {
            errors.push(`Invalid 'description': must be string, got ${typeof config.description}`);
        };
		
        if (config.coolDown!== undefined) {
            if (typeof config.coolDown!== 'number' || config.coolDown < 0) {
                errors.push(`Invalid 'coolDown': must be number >= 0, got ${config.coolDown}`);
            };
        };
		
        if (config.role!== undefined) {
            if (typeof config.role!== 'number' ||!validRoles.includes(config.role)) {
                errors.push(`Invalid 'role': must be 0, 1, 2, or 3, got ${config.role}`);
            };
        };
		
        if (config.author && typeof config.author!== 'string') {
            errors.push(`Invalid 'author': must be string, got ${typeof config.author}`);
        };
		
        if (config.aliases &&!Array.isArray(config.aliases)) {
            errors.push(`Invalid 'aliases': must be array, got ${typeof config.aliases}`);
        };
		
        return { valid: errors.length === 0, hasOnStart: true, errors, warnings };
    };
    
    buildTriggersMirror(specials) {
        const data = new Map();
        for (const [key, value] of specials) {
            for (const trigger of value.triggers) {
                data.set(trigger, key);
            };
        };
        
        return data;
    };

    loadCommands(Path = null, commandsPath = null, handlers=true, save=false) {
        if (!save) {
            this.data = {
                cmdsPerPage: this.data.cmdsPerPage,
                cmdsPage: [ [] ],
                prefix: this.data.prefix,
                admins: this.data.admins,
                commandsConfig: new Map(),
                aliases: new Map(),
                specials: new Map([
                    ['onMessages', {
                        triggers: [ 'message', 'message_reply' ],
                        runners: []
                    }],
                
                    ['onEvents', {
                        triggers: [ 'event', 'typ' ],
                        runners: []
                    }],
                
                    ['onReacts', {
                        triggers: [ 'message_reaction' ],
                        runners: []
                    }]
                ])
            };
        };
        
        if (!Path) {
            Path = path.join(__dirname, 'handlers');
        };
		
        if (!fs.existsSync(Path)) {
            fs.mkdirSync(Path);
            return;
        };
		
        const files = fs.readdirSync(Path).filter(file => file.endsWith('.js'));
        
        let loadedCmds = [];
        let handlerList = [];
        
        let notLoaded = [];
        let file = null;
        
        let page = 0;
        let pageContent = 0;
        const perPage = this.data.cmdsPerPage;
        
        for (const file of files) {
            if (pageContent === perPage) {
                pageContent = 0;
                page++;
                
                this.data.cmdsPage.push([]);
            };
            
            try {
                const filePath = path.join(Path, file);
                delete require.cache[require.resolve(filePath)];
                    
                let command = require(filePath);
                
                const validation = this.validateCommand(command, file);
				if (!validation.valid) {
                    origLog.error(chalk.red(`[INVALID CMD]`), `${file}:`);
                    validation.errors.forEach(error => origLog.warn(chalk.yellow(` -`), error));
                    
                    notLoaded.push(file);
                    continue;
                };
				
                if (validation.warnings.length > 0) {
                    origLog.warn(chalk.yellow(`[CMD WARN]`), `${file}:`);
                    validation.warnings.forEach(warn => origLog.warn(chalk.yellow(` -`), warn));
                };
				
                const origName = command.config?.name || file.replace('.js', '');
                const cmdName = origName.toLowerCase();
                if (typeof command.onStart === 'function') {
                    this.data.commandsConfig.set(cmdName, command);
                    loadedCmds.push(origName);
                    
                    this.data.cmdsPage[page].push(cmdName);
                    pageContent++;
                };
				
                if (command.config?.aliases) {
                    for (const alias of command.config.aliases) {
                        this.data.aliases.set(alias.toLowerCase(), cmdName)
                    };
                };
				
                const {
                    onStart, onMessage,
                    onEvent, onReact
                } = command;
                const specials = this.data.specials;
                
                if (typeof onMessage === 'function') {
                    specials.get('onMessages').runners.push(onMessage);
                    handlerList.push(`onMessage: ${origName}`);
                };
				
                if (typeof onEvent === 'function') {
                    specials.get('onEvents').runners.push(onEvent);
                    handlerList.push(`onEvent: ${origName}`);
                };
				
                if (typeof onReact === 'function') {
                    specials.get('onReacts').runners.push(onReact);
                    handlerList.push(`onReact: ${origName}`);
                };
            }
			
			catch (err) {
                origLog.error(chalk.red(`[CMD ERROR]`), `${file}: ${err.message}`);
                
                notLoaded.push(file);
            };
        };
        
        let handlerStr = '';
        let loadedStr = '';
        let notLoadedStr = '';
        let totalCmds = '';
        
        if (handlerList.length || loadedCmds.length) {
            handlerStr = handlerList.map(h => chalk.blue(`[HANDLER]: `) + h).join('\n');
            notLoadedStr = chalk.green(`\n\n[NOT LOADED]: `) + (notLoaded.length ? notLoaded.join(', ') : 'None');
            
            if (handlers) {}
            
            else {
                loadedStr = chalk.green(`[LOADED]: `) + loadedCmds.join(', ');
                totalCmds = chalk.green(`\n\n[TOTAL CMDS]: `) + loadedCmds.length;
            };    
            
            console.log(handlerStr + (handlerList.length? '\n\n' : '') + loadedStr + notLoadedStr + totalCmds);
		};
        
        if (handlers) {
            this.loadCommands(commandsPath, null, false, true);
            this.data.triggersMirror = this.buildTriggersMirror(this.data.specials);
        };
    };

    async calculate(send, num1, op, num2) {
        const result = await this.serverFunc(null, null, { bal: num1, operation: op, offset: num2 }, null, 'calculate/singel');
        if (!result.success) {
            await send(result.msg || '❌ Calc error');
            return 'exit';
        };
		
        return result.value;
    };

    async compare(send, num1, num2) {
        const result = await this.serverFunc(null, null, { a: num1, b: num2 }, null, 'compare');
        if (!result.success) {
            await send(result.msg || '❌ Compare error');
            return 0;
        };
		
        return result.result;
    };

    async validateBet(send, bet, bal, body1 = 'bet', body2 = 'balance') {
        const result = await this.serverFunc(null, null, { userBet: bet, userBal: bal, body1, body2 }, null, 'validate_bet');
        if (!result.valid) {
            await send(result.msg || '⚠️ Invalid bet');
            return 'exit';
        };
        return result.value;
    };
};


async function addFont(text, style = 'bold', outOutput = false) {
    if (!text) return '';
	
    const fontStyle = style.toLowerCase();
	
    const font = fontMap.get(fontStyle);
    if (!font) return text;
	
    const result = Array.from(text).map(char => {
        const code = char.charCodeAt(0);
        if (code >= 65 && code <= 90) return font.upper[code - 65] || char;
        if (code >= 97 && code <= 122) return font.lower[code - 97] || char;
        if (code >= 48 && code <= 57) return font.number[code - 48] || char;
        return char;
    }).join('');
	
    if (outOutput) origLog.log(result);
    return result;
};


const systemData = new SystemCore();


module.exports = {
    systemData,
    addFont,
    origLog,
    fontMap
};