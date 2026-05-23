const isPositiveWhole = (str) => /^[1-9]\d*$/.test(str.trim());


async function executeHelp({ send, systemData, rawArgs, addFont }) {
    const { commandsConfig, prefix, cmdsPage, cmdsPerPage } = systemData.getData();
    
    let targetCmd = rawArgs[0];
    totalPages = cmdsPage.length;
    
    if (!targetCmd) {
        await helpCmdsList(send, prefix, commandsConfig, addFont, cmdsPage[0], 1, 1, totalPages);
        return;
    } 
    
    else {
        const num = parseInt(targetCmd);
        
        if (targetCmd.toLowerCase() === '-all') {
            await helpCmdsList(send, prefix, commandsConfig, addFont);
            return;
        }
        
        else if (isPositiveWhole(targetCmd)) {
            const page = parseInt(targetCmd) - 1;
            if (page+1 > totalPages) {
                await send(`⚠️ Page ${page+1} does not exist`);
                return;
            };
            
            const pageStart = (page * cmdsPerPage);
            await helpCmdsList(send, prefix, commandsConfig, addFont, cmdsPage[page], pageStart+1, page+1, totalPages);
            return;
        }
        
        else if (!isNaN(num) && num >= 0) {
            return;
        };
    };

    targetCmd = targetCmd.toLowerCase();
    const cmdData = commandsConfig.get(targetCmd);

    if (!cmdData) {
        const errMsg = await addFont('Command not found. Please try again', 'bold');
        await send(`⚠️ ${errMsg}`);
        
        return;
    };

    await helpCmdInfo(cmdData, prefix, send, addFont);
};


async function helpCmdsList(send, prefix, commandsConfig, addFont, data=null, pageStart=1, page=null, totalPage=null) {
    const line = '━━━━━━━━━━━━━━';
    const title = await addFont('Commands', 'serif');
    let listBody = `📗 NΣXUS ${title}\n${line}\n`;
    let idx = pageStart;

    for (const commandName of (data || commandsConfig.keys())) {
        const { name, description } = commandsConfig.get(commandName).config;
        listBody += `${await addFont(`${idx++}`, 'serif')}. ${name}${data ? ' - ' + description : ''}\n`;
    };

    const sysPrefix = await addFont(`System Prefix: ${prefix}`, 'serif');
    const totalCmds = await addFont(`Total Cmds: ${commandsConfig.size}`, 'serif');
    
    listBody += `\n⚙️ ${sysPrefix}\n📊 ${totalCmds}\n${line}`;
    
    if (data) {
        const pageText = await addFont(`Page: ${page}/${totalPage}\n`);
        listBody += `\n ${pageText}`;
    };
        
    const tipsText = await addFont(`Tips:`, 'serif');
    listBody += await addFont(`\n💡 ${tipsText}\nType: '${prefix}Help <page or -all>' for commands\nType: '${prefix}Help <command>' for details`, 'typewriter');
    
    await send(listBody);
};


async function helpCmdInfo(commandConfig, prefix, send, addFont) {
    let { name, description, usage, author, role, coolDown, aliases } = commandConfig.config;
    usage = usage.replace(/\[prefix\]/g, prefix);
    
    const roleMap = {
        0: 'Everyone',
        1: 'Everyone',
        2: 'Admins / Chat box admins',
        3: 'Admins'
    };
    
    role = roleMap[role];
    
    const line = '━━━━━━━━━━━━━━';
    const title = await addFont('Information', 'serif');
    const nameText = await addFont(`Name: ${name}`, 'italic');
    const descText = await addFont(`Description: ${description}`, 'italic');
    const cdText = await addFont(`Cooldown: ${coolDown}s`, 'italic');
    const usageText = await addFont(`Usage: ${usage}`, 'italic');
    const aliasText = await addFont(`Aliases: ${aliases.join(', ') || 'None'}`, 'italic');
    const authorText = await addFont(`Author: ${author}`, 'italic');
    const roleText = await addFont(`Role: ${role}`, 'italic');
    
    const infoBody = `📖 ❲ ${title} ❳ 📖\n${line}\n✏️ ${nameText}\n📑 ${descText}\n⏱️ ${cdText}\n🛰 ${usageText}\n🔤 ${aliasText}\n👑 ${authorText}\n🌐 ${roleText}\n${line}`;
    await send(infoBody);
};


module.exports = {
    config: {
        name: 'Help',
        description: 'See all cmds and info',
        usage: '[prefix]help <page> or [prefix]help <command> or [prefix]help -all',
        author: 'Prince',
        role: 0,
        coolDown: 5,
        aliases: ['cmds']
    },
    
    onStart: executeHelp,
    
    onMessage: async function({ send, systemData, messageData, rawArgs, addFont }) {
        const body = (messageData.body || '').toLowerCase();
        const [cmd] = body.split(' ');
        
        if (cmd === 'help') {
            await executeHelp({
                send,
                systemData,
                rawArgs,
                addFont
            });
        };
    }
};