const { Client, GatewayIntentBits } = require('discord.js');
const { AudioPlayer, AudioResource, createAudioPlayer, createAudioResource, joinVoiceChannel, VoiceConnectionStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const prefix = '/';

let audioPlayer = createAudioPlayer();
let connection = null;

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'play') {
        const url = args[0];
        if (!url) return message.reply('Please provide a YouTube URL.');

        playYouTube(url, message);
    }

    if (command === 'pause') {
        audioPlayer.pause();
        message.reply('Paused the music.');
    }

    if (command === 'skip') {
        audioPlayer.stop();
        message.reply('Skipped the track.');
    }
});

async function playYouTube(url, message) {
    if (!message.member.voice.channel) return message.reply('You need to join a voice channel first!');

    if (connection === null) {
        connection = joinVoiceChannel({
            channelId: message.member.voice.channel.id,
            guildId: message.guild.id,
            adapterCreator: message.guild.voiceAdapterCreator,
        });

        connection.on(VoiceConnectionStatus.Ready, () => {
            console.log('The bot has connected to the channel!');
        });

        connection.on(VoiceConnectionStatus.Disconnected, () => {
            console.log('The bot has disconnected from the channel.');
            connection = null;
        });
    }

    const stream = ytdl(url, { filter: 'audioonly' });
    const resource = createAudioResource(stream);
    audioPlayer.play(resource);
    connection.subscribe(audioPlayer);

    message.reply('Playing from YouTube.');
}

client.login('MTI3ODQ2MTM4MDkyNzk1MDkxMA.GVJgpf.ORSpFujybuxorqKWIR5xcrMBQippxDEiQAR2bI');
