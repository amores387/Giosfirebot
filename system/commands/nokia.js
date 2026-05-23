const fs = require('fs');
const path = require('path');


module.exports = {
    config: {
        name: 'Nokia',
        description: 'Random nokia images.',
        usage: '[prefix]Nokia',
        author: 'PrinceDev',
        role: 0,
        coolDown: 5,
        aliases: []    
    },
    
    onStart: async function({ send, addFont }) {
        const nokiasDir = path.join(__dirname, `../../images/nokias`);
        
        const images = fs.readdirSync(nokiasDir).filter(file => file.endsWith('.jpg'));
        const randomImg = images[Math.floor(Math.random() * images.length)];
        
        const imgPath = path.join(nokiasDir, randomImg);
		const imgStream = fs.createReadStream(imgPath);
        
        await send({
			attachment: imgStream,
			body: await addFont('📱 Nokia', 'bold')
		});
    }
};