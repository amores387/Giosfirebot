function isDigit(str) { return /^\d+$/.test(str); }


async function showWifiList(addFont, send, wifiData, edit=false, api=null, messageID=null) {
    let wifiBody = await addFont('DETECTED WIFI:\n', 'bold');
    for (const [idx, wifi] of wifiData.entries()) {
        wifiBody += await addFont(`${idx+1}. `, 'bold') + wifi.name + '\n';
    }
    
    let success = false;
    if (wifiData.length) {
        wifiBody += '\nReply: show <number> to show info.';
        success = true;
    }
    
    else {
        wifiBody += 'No wifi detected. GPS ON mo bro';
    };
    
    if (!edit) {
        const res = await send(wifiBody);
        return { messageID: res.messageID, success };
    };
    
    await api.editMessage(wifiBody, messageID);
};


async function showWifiData(messageID, addFont, api, wifiData) {
    const { name, speed, bar, frequency, security } = wifiData;
    
    const nameTag = await addFont('Name: ', 'bold') + name;
    const speedTag = await addFont('Speed: ', 'bold') + speed;
    const barTag = await addFont('Bar: ', 'bold') + bar;
    const frequencyTag = await addFont('Frequency: ', 'bold') + frequency;
    const securityTag = await addFont('Security: ', 'bold') + security;
    
    const msg = `${nameTag}\n${speedTag}\n${barTag}\n${frequencyTag}\n${securityTag}\n\nReply: back`;
    await api.editMessage(msg, messageID);
};


function formatWifiData(wifiData) {
    try {
        if (!Array.isArray(wifiData) || wifiData.length === 0) return [];
        return wifiData.map(net => {
            const name = net.ssid || '<Hidden>';
            const rssi = net.rssi || 0;
            
            const freq = net.frequency_mhz || 0;
            let signal = rssi <= -100? 0 : rssi >= -50? 100 : 2 * (rssi + 100);
            let tag = signal >= 80? 'Very Strong' : signal >= 60? 'Strong' : signal >= 40? 'Medium' : signal > 0? 'Weak' : 'No Signal';
            const speed = `${signal}% ${tag}`;
            let bar = signal >= 75? '▂▄▆█' : signal >= 50? '▂▄▆_' : signal >= 25? '▂▄__' : signal > 0? '▂___' : '____';
            let frequency = freq >= 2400? `${(freq/1000).toFixed(1)}GHz` : `${freq}MHz`;
            const caps = net.capabilities || '';
            let security = caps.includes('WPA3')? 'WPA3' : caps.includes('WPA2')? 'WPA2' : caps.includes('WPA')? 'WPA' : caps.includes('WEP')? 'WEP' : 'OPEN';
            
            return { name, speed, bar, frequency, security };
        });
    }
    
    catch (e) { return []; }
};


const { execSync } = require('child_process');


module.exports = {
    config: {
        name: 'WifiScan',
        description: 'Show detected wifi',
        usage: '[prefix]Wifi',
        author: 'PrinceDev',
        role: 3,
        coolDown: 5,
        aliases: ['radar']
    },
    
    onStart: async function({ send, addFont, systemData }) {
        const { saveData, getSavedData } = systemData;

        try {
            const raw = execSync('termux-wifi-scaninfo', {encoding: 'utf8'});
            const wifiData = formatWifiData(JSON.parse(raw));

            const res = await showWifiList(addFont, send, wifiData);
            if (!res.success) return;

            const { messageID } = res;
            wifiMessageIDs = getSavedData('wifiMessageIDs');
            
            wifiMessageIDs[messageID] = { edited: false, wifiData };
            saveData({ wifiMessageIDs });
        }
        
        catch (e) {
            await send('❌ Error: pkg install termux-api + Location permission in Termux:API');
        };
    },
    
    onMessage: async function({ systemData, send, addFont, messageData, api }) {
        const { saveData, getSavedData } = systemData;
        const { messageReply } = messageData;
        const rawArgs = messageData.args;
        
        if (!messageReply) return;

        const wifiMessageIDs = getSavedData('wifiMessageIDs');
        if (!wifiMessageIDs) return;

        const { messageID } = messageReply;
        if (!(messageID in wifiMessageIDs)) return;

        const wifiObj = wifiMessageIDs[messageID];
        const wifiList = wifiObj.wifiData;

        if (!wifiObj.edited) {
            const action = rawArgs[0]?.toLowerCase();
            
            if (action!== 'show') return;

            let idx = rawArgs[1];
            if (!isDigit(idx)) return await send('Enter valid number');

            idx = parseInt(idx);
            if (idx <= 0) return await send('Enter a positive number.');
            if (idx > wifiList.length) return await send('Index out of range.');

            const wifi = wifiList[idx-1];
            wifiObj.edited = true;
            
            saveData({ wifiMessageIDs });
            await showWifiData(messageID, addFont, api, wifi);
        }
        
        else {
            const ac = rawArgs[0]?.toLowerCase();
            if (ac!== 'back') return;

            wifiObj.edited = false;
            
            saveData({ wifiMessageIDs });
            await showWifiList(addFont, null, wifiList, true, api, messageID);
        };
    }
};