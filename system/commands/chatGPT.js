const axios = require("axios");


module.exports = {
    config: {
        name: "Gpt",
        author: "PrinceDev",
        description: "gpt command.",
        usage: "[prefix]gpt <query>",
        role: 0,
        aliases: [],
        coolDown: 5
    },
	
    onStart: async function ({ send, rawArgs }) {
        const query = rawArgs.join(' ').toLowerCase();
		if (!query) {
            await send("⚠️ Please enter your question.");
            return;
        };

        const url = `https://urangkapolka.vercel.app/api/chatgpt4?prompt=${encodeURIComponent(query)}`;

        try {
			const res = await axios.get(url);
            const answer = res.data?.response;

            if (!answer) {
                await send("⛔️ No answer found");
                return;
            };

            await send(answer);
        }
		
		catch (err) {
            await send(`⚠️ Unknown error occured.\n⚠️ [ ai ]: ${err.message}`);
        };
    }
};