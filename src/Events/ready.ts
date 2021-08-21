import { Event } from "../Interfaces";

export const event: Event = {
    name: 'ready',
    run: () => {
        console.log('Client started');        
    }
}