import { Client, Collection } from "discord.js";
import { readdirSync } from "fs";
import path from "path";
import { config } from "../Config/config";
import { Command } from "../Interfaces";

class ExtendedClient extends Client {
    public commands: Collection<string, Command> = new Collection();
    public events: Collection<string, Event> = new Collection();
    public aliases: Collection<string, Command> = new Collection();

    public async init() {
        //Commands
        const commandPath = path.join(__dirname, "..", "Commands");
        readdirSync(commandPath).forEach((dir) => {
            const commands = readdirSync(`${commandPath}/${dir}`).filter((file) => file.endsWith('.ts'));
            commands.forEach(file => {
                const { command } = require(`${commandPath}/${dir}/${file}`);
                this.commands.set(command.name, command);

                command?.aliases?.length && command.aliases.forEach((alias: any) => {
                    this.aliases.set(alias, command);
                });
            });
        });

        //Events
        const eventPath = path.join(__dirname, "..", "Events");
        readdirSync(eventPath).forEach(async (file) => {
            const { event } = await require(`${eventPath}/${file}`);
            this.events.set(event.name, event);
            this.on(event.name, event.run.bind(null, this));
        });

        await this.login(config.token);
    }
}

export default ExtendedClient;