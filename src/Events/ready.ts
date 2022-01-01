import { Event } from "../Interfaces";

export const event: Event = {
    name: 'ready',
    run: (client) => {
        client.logger.started();        
    }
}