class Queue {
    constructor() {
        this.queues = [];
        this.processing = false;
        
        this.handler = () => {};
    };
    
    async processQueue() {
        if (this.processing) return;
        
        this.processing = true;
        while (this.queues.length) {
            const [queue, data] = this.queues.shift();
            
            try {
                const result = await this.handler(queue, data);
                
                if (result === 'exit') {
                    this.queues = [];
                    return 'exit';
                };
            }
            
            catch (err) {
                console.log(`[Queue]: ${err}`);
            };
        };
            
        this.processing = false;
    };
    
    async addQueue(queue, data) {
        this.queues.push([queue, data]);
        return await this.processQueue();
    };
    
    setHandler(handler) {
        this.handler = handler;
    };
};


module.exports = Queue;