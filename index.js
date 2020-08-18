const fs = require("fs");
const discord = require("discord.js");
const prefix = "!";
const client = new discord.Client();

const { CanvasSenpai } = require("canvas-senpai")
const canva = new CanvasSenpai();

const cooldown = new Set()
const cdtime = 5 //This is in seconds

client.commands = new discord.Collection();

const commandFiles = fs
  .readdirSync("./commands")
  .filter(file => file.endsWith("js"));

client.aliases = new discord.Collection();
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  command.aliases.forEach(alias => client.aliases.set(alias, command.name));
  client.commands.set(command.name, command);
}

client.on("ready", () => {
  console.log("Im online" + ` ${client.user.tag}`);
});

client.on("message", async message => {
  if (message.author.bot) return;

  if (!message.content.startsWith(prefix)) return;
  //What i will type now must be in a message event under "if(!message.content.startSwith(prefix)) return"
  
  if(cooldown.has(message.author.id)){
    return message.channel.send("Please wait 5 seconds between each commands")
  }
  cooldown.add(message.author.id)
  
  setTimeout(() => {
    cooldown.delete(message.author.id)
  }, cdtime * 1000) //This should be in millisends (ms)

  if (!message.member)
    message.member = await message.guild.fetchMember(message);
  const args = message.content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();
  const cmd =
    client.commands.get(command) ||
    client.commands.get(client.aliases.get(command));

  if (cmd === null) return;

  if (cmd) cmd.run(client, message, args);
  if (!cmd) return;
});


client.on("guildMemberAdd" , async member => {
  const channel = member.guild.channels.cache.find(ch => ch.name === "welcome")
  if(!channel) return
  
  let data = await canva.welcome(member , {link: "https://wallpapercave.com/wp/wp5128415.jpg"})
  
  let image = new discord.MessageAttachment(data, "welcome.jpg")
  
  channel.send(image)
})

client.login(process.env.TOKEN);
