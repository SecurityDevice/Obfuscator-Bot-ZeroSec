const Discord = require('discord.js');
const { Client, Intents } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const ZeroSecAPI = require('zerosec-api').default;
const fetch = require('node-fetch');

// Configs
const apiKey = '';

const APPLICATION_ID = '';
const GUILD_ID = '';
const BOT_TOKEN = '';

const zeroSec = new ZeroSecAPI(apiKey);
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });


const commands = [{
  name: 'obfuscate',
  description: 'Obfuscate a Lua script with ZeroSec API.',
  options: [
    {
      name: 'script',
      type: 11, // ATTACHMENT
      description: 'Script to obfuscate.',
      required: true,
    },
    {
      name: 'platformlock',
      type: 3, // STRING
      description: 'The platform to lock the script to.',
      required: true,
      choices: [
        { name: 'Lua 5.4', value: 'lua' },
        { name: 'Roblox', value: 'roblox' },
        { name: 'CS:GO', value: 'csgo' },
        { name: 'FiveM', value: 'fivem' },
      ],
    },
    {
      name: 'watermark',
      type: 3, // STRING
      description: 'The watermark to be added to the script?',
      required: true,
    },
    {
      name: 'antitamper',
      type: 5, // BOOLEAN
      description: 'Activate anti-tamper protection?',
      required: true,
    },
    {
      name: 'encryptstrings',
      type: 5, // BOOLEAN
      description: 'Should string encryption be activated?',
      required: true,
    },
    {
      name: 'maxsecurity',
      type: 5, // BOOLEAN
      description: 'Should maximum security be activated?',
      required: true,
    },
    {
      name: 'constantencryption',
      type: 5, // BOOLEAN
      description: 'Should constant encryption be activated?',
      required: true,
    },
  ],
}];


const rest = new REST({ version: '9' }).setToken(BOT_TOKEN);
rest.put(Routes.applicationGuildCommands(APPLICATION_ID, GUILD_ID), { body: commands })
  .then(() => console.log('Created slash-parameters.'))
  .catch(console.error);


client.once('ready', () => {
    console.log('Ready!');
    client.user.setActivity('with Code', { type: 'PLAYING' });
});

let lastAttachmentName = '';

client.on('interactionCreate', async interaction => {
  console.log('Created interaction');
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'obfuscate') {
    const scriptAttachment = interaction.options.getAttachment('script');
    const scriptUrl = scriptAttachment.url;
    const script = scriptUrl;
    lastAttachmentName = script.name;
    const platformLock = interaction.options.getString('platformlock');
    const watermark1 = interaction.options.getString('watermark');
    const watermark = `"${watermark1}"`;
    const antiTamper = interaction.options.getBoolean('antitamper');
    const encryptStrings = interaction.options.getBoolean('encryptstrings');
    const maxSecurity = interaction.options.getBoolean('maxsecurity');
    const constantEncryption = interaction.options.getBoolean('constantencryption');
    const response = await fetch(scriptUrl);
    const scriptContent = await response.text();


    zeroSec.obfuscate({
      script: scriptContent,
      platformLock,
      watermark,
      antiTamper,
      encryptStrings,
      maxSecurity,
      constantEncryption,
      giveBackURL: true,
    }).then((response) => {
      console.log(response.script); 
      interaction.reply({ content: `Your obfuscated Lua-Script is available here: ${response.script}`, ephemeral: true });
      console.log('Obfuscation finished:', response);
      interaction.user.send(`Hello ${interaction.user.username}! Your obfuscated Lua-Script is available here: ${response.script}`);
      client.user.setActivity(` with Code by: ${interaction.user.username}`, { type: 'PLAYING' });
    }).catch((error) => {
      console.error(error);
      interaction.reply('There was an error while obfuscating your script.');
    });
  }
}
);


client.login(BOT_TOKEN);