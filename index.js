#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const LastFm = require('lastfm-node-client');
const { Command } = require('commander');
const prompts = require('prompts');

const program = new Command();
program.version('0.0.1');

program
	.requiredOption('-a, --artist <artist>', 'artist')
	.requiredOption('-t, --track <track>', 'track')
	.option('-l, --album <album>', 'album')
	.option('-b, --album-artist <artist>', 'album artist')
	.option('-s, --session-key <key>', 'session key');

program.parse(process.argv);
const options = program.opts();

const LASTFM_API_KEY = process.env.LASTFM_API_KEY;
const LASTFM_API_SECRET = process.env.LASTFM_API_SECRET;

(async () => {
	let lfm;
	const sessionCache = path.resolve(__dirname, '.session_cache');

	if (!options.sessionKey) {
		try {
			options.sessionKey = fs.readFileSync(sessionCache).toString();
		} catch (e) {
			options.sessionKey = null;
		}
	}

	if (!options.sessionKey) {
		lfm = new LastFm(LASTFM_API_KEY, LASTFM_API_SECRET);

		const { token } = await lfm.authGetToken()

		console.log(`Confirm after authenticating at this url: http://www.last.fm/api/auth/?api_key=${LASTFM_API_KEY}&token=${token}`)

		const response = await prompts({
			type: 'confirm',
			name: 'value',
			message: 'Have you authenticated?',
		})

		if (!response.value) {
			console.log('Operation cancelled.');
			return;
		}

		const { session } = await lfm.authGetSession({ token })
		options.sessionKey = session.key

		fs.writeFile(sessionCache, session.key, () => {});
	}

	lfm = new LastFm(LASTFM_API_KEY, LASTFM_API_SECRET, options.sessionKey)

	lfm.trackScrobbleMany([{
		artist: options.artist,
		album: options.album,
		albumArtist: options.albumArtist,
		track: options.track,
		timestamp: Math.floor(Date.now() / 1000),
	}]).then(data => console.log(JSON.stringify(data)))
})()
