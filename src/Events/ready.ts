import { Event } from "../interfaces";

export const ready: Event = {
    name: 'ready',
    run: (client) => {
        client.logger.started();        
    }
}