const fs = require('fs');
const path = require('path');


module.exports = {
    config: {
        name: 'Women',
        description: 'Women cmd.',
        usage: '[prefix]Women',
        author: 'PrinceDev',
        role: 0,
        coolDown: 5,
        aliases: []    
    },
    
    onStart: async function({ send, addFont }) {
        const vidPath = path.join(__dirname, '../../videos/women.mp4');
		const vidStream = fs.createReadStream(vidPath);
        
        await send({
			attachment: vidStream,
			body: await addFont('☕️ Women', 'bold')
		});
    }
};