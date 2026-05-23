const fs = require('fs');
const path = require('path');


module.exports = {
    config: {
        name: 'Fb',
        description: 'Fb motivation.',
        usage: '[prefix]Fb',
        author: 'PrinceDev',
        role: 0,
        coolDown: 5,
        aliases: ['facebook']    
    },
    
    onStart: async function({ send, addFont }) {
        const imgPath = path.join(__dirname, '../../images/fb.jpg');
		const imgStream = fs.createReadStream(imgPath);
        
        await send({
			attachment: imgStream,
			body: await addFont('📘 Facebook', 'bold')
		});
    }
};