async function font({ fontType, text, outOutput = true, send }, addFont, fontMap) {
    const result = await addFont(text, fontType, false);

    if (result === text && fontType !== 'default') {
        const title = await addFont('Valid fonts:', 'bold');
        
        const validFontsFormatted = await Promise.all(
            fontMap.keys().map(async (f) => {
                const formatted = await addFont(f, f);
                return `— ${formatted}`;
            })
        );
        
        const validFontsBody = `${title}\n${validFontsFormatted.join('\n')}`;
        await send(validFontsBody);
        return;
    };

    if (outOutput) await send(result);
    else return result;
};


module.exports = {
    config: {
        name: 'Font',
        description: 'Applies specific font to a text',
        usage: '[prefix]Font <fontType> <text>',
        author: 'Prince',
        role: 0,
        coolDown: 5,
        aliases: ['addFont']
    },
	
    onStart: async function({ send, rawArgs, addFont, fontMap }) {
        let fontType = rawArgs[0];
        if (!fontType) {
            const errMsg = await addFont('Enter font to use.', 'bold');
            await send(`⚠️ ${errMsg}`);
            return;
        };
		
        let text = rawArgs.slice(1).join(' ');
        if (!text) {
            const errMsg = await addFont('Enter text to add font with.', 'bold');
            await send(`⚠️ ${errMsg}`);
            return;
        };
		
        fontType = fontType.toLowerCase();
        const fontData = { fontType, text, send };
        await font(fontData, addFont, fontMap);
    }
};