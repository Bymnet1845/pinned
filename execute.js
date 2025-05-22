import configration from "./configration.json" assert { type: "json" };
import { Client, Events, GatewayIntentBits, ActivityType, Partials } from "discord.js";
import { format } from "date-fns";
import cron from "node-cron";

const CLIENT = new Client({
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions],
	partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

CLIENT.login(configration.token);

CLIENT.on("ready", (event) => {
	outputLog(`${event.user.tag}としてログインします。`);
	setActivity();
	cron.schedule("0 0 * * * *", () => { setActivity(); });
});

CLIENT.on(Events.MessageReactionAdd, (reaction) => {
	receiveReactionChange(reaction, (reaction) => {
		reaction.message.pin();
	});
});

CLIENT.on(Events.MessageReactionRemove, (reaction) => {
	receiveReactionChange(reaction, (reaction) => {
		if (reaction.count === 0) reaction.message.unpin();
	});
});

async function receiveReactionChange(reaction, callback) {
	if (reaction.partial) {
		try {
			await reaction.fetch();
		} catch (error) {
			outputLog(error);
			return;
		}
	}

	if (reaction.emoji.name === "📌") callback(reaction);
}

function setActivity() {
	try {
		CLIENT.user.setActivity({ name: `稼働中（参加サーバー数：${CLIENT.guilds.cache.size}）`, type: ActivityType.Custom });
	} catch (error) {
		outputLog(error, true);
	}
}

function outputLog(message, error = false) {
	console.log(format(Date.now(), "[yyyy-MM-dd HH:mm:ss.SSS]"));

	if (error) {
		console.error(message);
	} else {
		console.log(message);
	}
}