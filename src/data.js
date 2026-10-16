/* FORK — sample lineage archive.
   Every object here is fictional SAMPLE DATA. No live platform data, reach, followers or prices.
   Hand-authored lineages + deterministic generated descendants (seeded), then derived metrics. */
(function () {
  'use strict';

  const SAMPLE_NOW = new Date('2026-10-16T00:00:00Z');
  const DAY = 864e5;

  const PLATFORMS = {
    REDDIT: 'Reddit', X: 'X', TIKTOK: 'TikTok', INSTAGRAM: 'Instagram', YOUTUBE: 'YouTube',
    TUMBLR: 'Tumblr', DISCORD: 'Discord', TWITCH: 'Twitch', ONCHAIN: 'Onchain',
    FACEBOOK: 'Facebook', TRUTH: 'Truth Social', ROBLOX: 'Roblox', TV: 'Film & TV', NEWS: 'News', FOURCHAN: '4chan', GAME: 'Games', IRL: 'Offline', WEB: 'Web'
  };

  const TYPES = ['POST', 'MEME', 'CHARACTER', 'TOKEN', 'COMMUNITY', 'VIDEO', 'SOUND', 'FORMAT', 'NARRATIVE', 'EVENT', 'GAME'];
  const STATUSES = ['ORIGIN', 'EMERGING', 'SPREADING', 'FORKING', 'PEAKING', 'COOLING', 'LEGACY'];

  const TRAITS = [
    ['visual', 'Visual identity'], ['format', 'Format'], ['platform', 'Platform'], ['audience', 'Audience'],
    ['tone', 'Tone'], ['symbols', 'Symbols'], ['token', 'Tokenization'], ['character', 'Character traits']
  ];

  const EVIDENCE_KINDS = {
    timestamp: 'Timestamp precedence',
    reference: 'Direct reference',
    media: 'Shared media asset',
    caption: 'Caption reference',
    crosslink: 'Platform cross-link',
    press: 'Press mention',
    community: 'Community reference',
    counter: 'Counter-claim'
  };

  const FAMILIES = [
    { id: 'viral-animals', name: 'Viral Animals', blurb: 'Creatures photographed at the right moment, then never left alone.', hub: [0, 0] },
    { id: 'ai-celebrities', name: 'AI Celebrities', blurb: 'Personas that began as a model output and became someone.', hub: [1250, -520] },
    { id: 'crypto-mascots', name: 'Crypto Mascots', blurb: 'Drawings and animals that picked up a ticker on the way.', hub: [1320, 760] },
    { id: 'brainrot', name: 'Brainrot', blurb: 'Nonsense that repeated until it meant something.', hub: [-1240, 700] },
    { id: 'reaction-formats', name: 'Reaction Formats', blurb: 'Clips cut down to a single feeling, reused forever.', hub: [-1300, -620] },
    { id: 'political-memes', name: 'Political Memes', blurb: 'Civic moments turned into formats. Fictional, non-partisan samples.', hub: [60, -1300] },
    { id: 'game-memes', name: 'Game Memes', blurb: 'Glitches, deaths and speedruns that outlived their games.', hub: [40, 1380] }
  ];

  /* ---------------- hand-authored lineages ---------------- */
  const RAW = [];
  function N(id, name, type, platform, date, parent, conf, family, o) {
    RAW.push(Object.assign({ id, name, type, platform, date, parent, conf, family }, o || {}));
  }

  // VIRAL ANIMALS — Midnight Frog
  N('midnight-frog', 'Midnight Frog', 'POST', 'REDDIT', '2019-08-14', null, 0.9, 'viral-animals', {
    handle: 'u/nightpond', stem: 'Midnight Frog',
    desc: 'A blurry 2:14 a.m. photo of a frog sitting under a porch light, captioned “he waits.”',
    aliases: ['he waits', '2:14 frog', 'porch frog', 'original post'], tags: ['frog', 'night', 'porch light'],
    traits: { visual: 'Blurry flash photo; one frog under a porch light', format: 'Single image post', audience: 'Late-night hobby forum',
      tone: 'Deadpan, faintly eerie', symbols: 'Porch light · 2:14 a.m. · “he waits”', token: 'None', character: 'A silent frog who waits' },
    ev: [['reference', 'Earliest copy in the sample archive; no earlier upload found'], ['community', 'Later posts credit “the porch frog post” on r/nightpond']]
  });
  N('frog-loop', 'Frog Loop', 'MEME', 'X', '2020-02-03', 'midnight-frog', 0.94, 'viral-animals', {
    handle: '@loopfrogs', stem: 'Frog Loop', desc: 'The photo turned into a caption template: “he waits (for ___).”',
    traits: { format: 'Looping caption template: “he waits (for ___)”', audience: 'Meme accounts', tone: 'Absurdist', symbols: 'Porch light · blank caption slot' },
    ev: [['reference', 'Caption reuses “he waits” verbatim'], ['media', 'Same photo, cropped square'], ['crosslink', 'First template post links the Reddit thread']]
  });
  N('he-waits-reaction', 'He Waits', 'MEME', 'X', '2020-06-11', 'frog-loop', 0.9, 'reaction-formats', {
    stem: 'He Waits', desc: 'The cropped frog used alone as a reply meaning “still waiting on you.”',
    traits: { format: 'Reaction image', tone: 'Passive-aggressive patience', audience: 'Reply-guys and group chats' },
    ev: [['media', 'Identical crop to Frog Loop'], ['caption', 'Often posted with “he waits” alt text']],
    grow: { n: 10, from: '2020-07-01', to: '2023-12-01', chain: 0.4 }
  });
  N('frogcoin', 'FROGCOIN', 'TOKEN', 'ONCHAIN', '2023-04-11', 'frog-loop', 0.68, 'crypto-mascots', {
    ticker: '$FROG', stem: 'Frogcoin', aliases: ['frog coin', 'frog token'],
    desc: 'A token whose logo is the Frog Loop crop. The deployer was anonymous.',
    traits: { visual: 'Frog Loop crop as a coin logo', format: 'Fungible token', audience: 'Meme traders', tone: 'Promotional, ironic', token: 'Ticker $FROG', character: 'Frog as mascot' },
    ev: [['media', 'Token logo matches the Frog Loop crop pixel-for-pixel'], ['community', 'Launch post (archived) says “he waits for the pump”']],
    grow: { n: 8, from: '2023-07-01', to: '2025-06-01', chain: 0.4 }
  });
  N('sir-waits', 'Sir Waits', 'CHARACTER', 'X', '2023-06-02', 'frogcoin', 0.88, 'crypto-mascots', {
    stem: 'Sir Waits', desc: 'Frogcoin’s mascot: the frog redrawn in a top hat.',
    traits: { visual: 'Illustrated frog in a top hat', format: 'Mascot account', character: 'Dignified mascot who waits for the price' },
    ev: [['reference', 'Bio: “official mascot of $FROG”'], ['crosslink', 'Linked from the token page']]
  });
  N('frog-dao', 'Frog DAO', 'COMMUNITY', 'DISCORD', '2023-08-19', 'frogcoin', 0.91, 'crypto-mascots', {
    stem: 'Frog DAO', desc: 'Holders’ server that votes on porch-light art commissions.',
    traits: { format: 'Chat community', audience: 'Token holders', tone: 'Earnest, governance-minded' },
    ev: [['crosslink', 'Invite pinned in token channel'], ['reference', 'Server name cites $FROG']]
  });
  N('porch-light-hours', 'Porch Light Hours', 'NARRATIVE', 'TUMBLR', '2020-10-29', 'midnight-frog', 0.61, 'viral-animals', {
    stem: 'Porch Light Hours', desc: 'A serialised horror story about a town where every porch light hides a waiting frog.',
    traits: { format: 'Serialised fiction', audience: 'Creepypasta readers', tone: 'Horror', symbols: 'Porch light · 2:14 a.m.' },
    ev: [['caption', 'Chapter one opens at 2:14 a.m.'], ['community', 'Readers connect it to the frog post; author has not confirmed']],
    grow: { n: 5, from: '2020-11-15', to: '2022-06-01', chain: 0.3 }
  });
  N('frog-walk', 'Frog Walk', 'VIDEO', 'TIKTOK', '2021-05-22', 'midnight-frog', 0.93, 'viral-animals', {
    handle: '@porchlight.av', stem: 'Frog Walk', desc: 'A frog filmed walking slowly across a porch to an ambient track, stamped 2:14.',
    traits: { visual: 'Night video; porch light; frog walking', format: 'Slow-walk video with ambient track', audience: 'Ambient and aesthetic TikTok', tone: 'Calm, eerie' },
    ev: [['reference', 'On-screen text: “2:14, he waits”'], ['crosslink', 'Creator links the Reddit post in bio']]
  });
  N('frog-walk-challenge', 'Frog Walk Challenge', 'FORMAT', 'TIKTOK', '2021-07-09', 'frog-walk', 0.95, 'viral-animals', {
    stem: 'Frog Walk', desc: 'People re-enact the walk under their own porch lights.',
    traits: { visual: 'People walking slowly under porch lights', format: 'Re-enactment challenge', audience: 'Teen TikTok', tone: 'Playful', character: 'Anyone can be the frog' },
    ev: [['media', 'Uses the original Frog Walk audio'], ['caption', '#frogwalk on every entry']],
    grow: { n: 10, from: '2021-08-01', to: '2023-06-01', chain: 0.35 }
  });
  N('night-shift-walk', 'Night Shift Walk', 'VIDEO', 'TIKTOK', '2022-03-14', 'frog-walk-challenge', 0.83, 'viral-animals', {
    stem: 'Night Shift Walk', desc: 'Nurses and warehouse workers doing the walk at the end of a shift.',
    traits: { visual: 'Hospital corridors and loading docks at night', audience: 'Night-shift workers', tone: 'Tired solidarity' },
    ev: [['media', 'Same ambient audio'], ['caption', '“frog walk but it’s 2:14 on shift”']],
    grow: { n: 9, from: '2022-04-01', to: '2024-12-01', chain: 0.5 }
  });
  N('frogcore', 'Frogcore', 'COMMUNITY', 'INSTAGRAM', '2022-01-17', 'frog-walk', 0.72, 'viral-animals', {
    stem: 'Frogcore', desc: 'An aesthetic of moss, amber porch light and knitted frogs.',
    traits: { visual: 'Moss, amber porch light, knitwear', format: 'Aesthetic moodboards', audience: 'Cottagecore crossover', tone: 'Cozy', symbols: 'Porch light · moss · frog' },
    ev: [['community', 'Early boards include Frog Walk stills'], ['caption', 'Tag first used alongside #frogwalk']],
    grow: { n: 8, from: '2022-02-15', to: '2025-09-01', chain: 0.35 }
  });
  N('porchlight-club', 'Porchlight Club', 'COMMUNITY', 'DISCORD', '2022-09-03', 'frogcore', 0.87, 'viral-animals', {
    stem: 'Porchlight Club', desc: 'A server for people who photograph their porch lights at 2:14.',
    traits: { format: 'Chat community', audience: 'Night photographers', tone: 'Quiet, ritualistic' },
    ev: [['crosslink', 'Invite shared from Frogcore boards'], ['reference', 'Server rules mention 2:14']]
  });
  N('frogcore-knit', 'Frogcore Knit', 'FORMAT', 'INSTAGRAM', '2023-02-08', 'frogcore', 0.9, 'viral-animals', {
    stem: 'Frogcore Knit', desc: 'Free knitting patterns for the porch frog.',
    traits: { visual: 'Knitted green frogs', format: 'Pattern share', audience: 'Knitters' },
    ev: [['caption', 'Tagged #frogcore'], ['reference', 'Pattern named “he waits”']]
  });
  N('frog-walk-lagos', 'Frog Walk: Lagos Cut', 'VIDEO', 'TIKTOK', '2026-09-12', 'frog-walk', 0.86, 'viral-animals', {
    stem: 'Lagos Walk', desc: 'A 2026 revival: the walk re-shot on a Lagos street to an Afrobeats track.',
    traits: { visual: 'Re-shot on a Lagos street at night', format: 'Dance edit', audience: 'Lagos dance scene', tone: 'Celebratory' },
    ev: [['caption', '“frog walk, Lagos cut”'], ['media', 'Opens with the original 2:14 stamp']],
    grow: { n: 16, from: '2026-09-15', to: '2026-10-15', chain: 0.25 }
  });
  N('wendell', 'Wendell', 'CHARACTER', 'X', '2024-02-19', 'midnight-frog', 0.9, 'ai-celebrities', {
    handle: '@wendell_waits', stem: 'Wendell', aliases: ['ai frog', 'wendell the frog'],
    desc: 'An AI persona that posts as the Midnight Frog every night at 2:14.',
    traits: { visual: 'The porch-light frog, AI-rendered', format: 'AI persona account', audience: 'AI-curious posters', tone: 'Melancholic, self-aware', character: 'A frog who knows he is waiting; replies in lowercase' },
    ev: [['reference', 'Bio: “i am the frog from the porch. i wait.”'], ['media', 'Avatar upscaled from the original photo'], ['crosslink', 'Pinned post links the Reddit thread']],
    grow: { n: 7, from: '2024-06-01', to: '2026-06-01', chain: 0.3 }
  });
  N('wendell-replies', 'Wendell Replies', 'FORMAT', 'X', '2024-05-07', 'wendell', 0.92, 'ai-celebrities', {
    stem: 'Wendell Replies', desc: 'Screenshots of Wendell answering strangers, shared as a format.',
    traits: { format: 'Reply screenshot', audience: 'Screenshot accounts' },
    ev: [['media', 'Screenshots of @wendell_waits'], ['reference', 'Watermarked with his handle']]
  });
  N('wndl', '$WNDL', 'TOKEN', 'ONCHAIN', '2024-11-21', 'wendell', 0.38, 'crypto-mascots', {
    ticker: '$WNDL', stem: 'WNDL', desc: 'A token using Wendell’s avatar. The persona denies any connection.',
    traits: { format: 'Fungible token', audience: 'Meme traders', tone: 'Promotional', token: 'Ticker $WNDL' },
    ev: [['media', 'Uses Wendell’s avatar'], ['counter', 'Wendell posted “that is not me” two days after launch']]
  });
  N('wendell-voice', 'Wendell Voice Clips', 'VIDEO', 'TIKTOK', '2025-03-30', 'wendell', 0.8, 'ai-celebrities', {
    stem: 'Wendell Voice', desc: 'Synthetic voice readings of Wendell’s posts over the Frog Walk audio.',
    traits: { format: 'Voice-over clip', audience: 'Ambient TikTok', visual: 'Static porch frame with captions' },
    ev: [['media', 'Frog Walk ambient track'], ['caption', 'Credits @wendell_waits']]
  });
  N('stair-goat', 'Stair Goat', 'VIDEO', 'YOUTUBE', '2018-06-09', null, 0.86, 'viral-animals', {
    stem: 'Stair Goat', desc: 'A goat riding a stairlift, unbothered, for eleven seconds.',
    traits: { visual: 'Goat on a beige stairlift', format: 'Home video', audience: 'Animal-clip channels', tone: 'Serene', symbols: 'Stairlift · the slow ascent', token: 'None', character: 'Calm goat' },
    ev: [['reference', 'Earliest upload in the sample archive']],
    grow: { n: 18, from: '2018-07-01', to: '2025-12-01', chain: 0.45 }
  });

  // AI CELEBRITIES
  N('unit-mae', 'Unit Mae', 'CHARACTER', 'TWITCH', '2024-09-14', null, 0.8, 'ai-celebrities', {
    stem: 'Unit Mae', desc: 'An AI DJ persona that streams for 24 hours and takes requests from chat.',
    traits: { visual: 'Low-poly avatar behind decks', format: 'Always-on stream', audience: 'Late-night chat', tone: 'Upbeat, glitchy', symbols: 'The request queue', token: 'None', character: 'DJ who never sleeps' },
    ev: [['reference', 'First stream VOD in sample archive']],
    grow: { n: 16, from: '2024-10-01', to: '2026-08-01', chain: 0.4 }
  });

  // BRAINROT — The Glorp
  N('the-glorp', 'The Glorp', 'VIDEO', 'TIKTOK', '2023-01-12', null, 0.88, 'brainrot', {
    handle: '@claymotion', stem: 'Glorp', aliases: ['glorp'],
    desc: 'A four-second stop-motion clay blob that says “glorp” and falls over.',
    traits: { visual: 'Green clay blob, stop-motion', format: 'Four-second clip', audience: 'Teen TikTok', tone: 'Nonsense', symbols: '“glorp” · the fall', token: 'None', character: 'A blob with one word' },
    ev: [['reference', 'Earliest upload in the sample archive']]
  });
  N('glorp-sound', 'Glorp (sound)', 'FORMAT', 'TIKTOK', '2023-02-02', 'the-glorp', 0.96, 'brainrot', {
    stem: 'Glorp', desc: 'The audio, detached from the clip and played under anything that fails.',
    traits: { visual: 'Any failure clip', format: 'Reusable sound', character: 'Blob is gone; only the word remains' },
    ev: [['media', 'Original audio ID'], ['caption', 'Sound page credits @claymotion']],
    grow: { n: 14, from: '2023-02-15', to: '2025-12-01', chain: 0.55 }
  });
  N('glorpspeak', 'Glorpspeak', 'MEME', 'X', '2023-05-18', 'the-glorp', 0.7, 'brainrot', {
    stem: 'Glorpspeak', desc: '“Glorp” used as a verb, an adjective and a full sentence.',
    traits: { format: 'Text slang', visual: 'None; text only', audience: 'Group chats', tone: 'Ironic' },
    ev: [['caption', 'Early posts link the clip'], ['community', 'Slang glossaries cite the clip']],
    grow: { n: 8, from: '2023-06-01', to: '2025-06-01', chain: 0.3 }
  });
  N('glorp-tuesday', 'Glorp Tuesday', 'EVENT', 'DISCORD', '2024-03-05', 'glorpspeak', 0.63, 'brainrot', {
    stem: 'Glorp Tuesday', desc: 'A weekly ritual in which a server only types “glorp” on Tuesdays.',
    traits: { format: 'Weekly ritual', audience: 'Small servers', tone: 'Ceremonial nonsense' },
    ev: [['community', 'Server lore credits Glorpspeak'], ['caption', 'Announcement uses the blob emoji']]
  });
  N('glorp-2026', 'Glorp 2026', 'VIDEO', 'TIKTOK', '2026-09-28', 'the-glorp', 0.79, 'brainrot', {
    stem: 'Glorp', desc: 'The creator re-animates the blob three years later. It falls over again.',
    traits: { visual: 'Same blob, sharper animation', format: 'Sequel clip', tone: 'Nostalgic nonsense' },
    ev: [['reference', 'Posted by @claymotion'], ['media', 'Reuses the original audio']],
    grow: { n: 12, from: '2026-09-30', to: '2026-10-15', chain: 0.2 }
  });
  N('fridge-opera', 'Fridge Opera', 'VIDEO', 'YOUTUBE', '2024-06-01', null, 0.82, 'brainrot', {
    stem: 'Fridge Opera', desc: 'A refrigerator’s hum pitch-shifted into an aria, with subtitles.',
    traits: { visual: 'Static shot of a fridge', format: 'Audio edit', audience: 'Shitpost YouTube', tone: 'Mock-grand', symbols: 'The hum · subtitles', token: 'None', character: 'A fridge with feelings' },
    ev: [['reference', 'Earliest upload in the sample archive']],
    grow: { n: 14, from: '2024-06-15', to: '2026-07-01', chain: 0.45 }
  });

  // CRYPTO MASCOTS — Pocket Goose
  N('pocket-goose', 'Pocket Goose', 'POST', 'X', '2021-11-08', null, 0.87, 'crypto-mascots', {
    handle: '@goosepocket', stem: 'Pocket Goose',
    desc: 'A drawing of a goose living in someone’s coat pocket, honking at receipts.',
    traits: { visual: 'Ink drawing of a goose in a coat pocket', format: 'Single drawing', audience: 'Illustration Twitter', tone: 'Grumpy-cute', symbols: 'Coat pocket · receipts · honk', token: 'None', character: 'A goose who hates spending' },
    ev: [['reference', 'Earliest post in the sample archive']]
  });
  N('honk', '$HONK', 'TOKEN', 'ONCHAIN', '2022-01-14', 'pocket-goose', 0.82, 'crypto-mascots', {
    ticker: '$HONK', stem: 'HONK', desc: 'A token with the pocket goose as its mascot, launched with the artist’s blessing.',
    traits: { format: 'Fungible token', audience: 'Meme traders', tone: 'Promotional', token: 'Ticker $HONK', character: 'Goose as mascot' },
    ev: [['crosslink', 'Artist reposted the launch'], ['media', 'Uses the original drawing']],
    grow: { n: 12, from: '2022-03-01', to: '2025-04-01', chain: 0.5 }
  });
  N('goose-guard', 'Goose Guard', 'COMMUNITY', 'DISCORD', '2022-02-20', 'honk', 0.9, 'crypto-mascots', {
    stem: 'Goose Guard', desc: 'Holders’ server; mostly goose drawings.',
    traits: { format: 'Chat community', audience: 'Token holders' },
    ev: [['crosslink', 'Linked from $HONK page'], ['reference', 'Server named for the goose']]
  });
  N('pocket-goose-comics', 'Pocket Goose Comics', 'NARRATIVE', 'INSTAGRAM', '2022-05-01', 'pocket-goose', 0.93, 'crypto-mascots', {
    stem: 'Pocket Goose', desc: 'The artist’s weekly comic: the goose versus late-stage consumerism.',
    traits: { format: 'Weekly comic', audience: 'Instagram comic readers' },
    ev: [['reference', 'Same artist account'], ['media', 'Same character design']],
    grow: { n: 7, from: '2022-06-01', to: '2025-10-01', chain: 0.3 }
  });
  N('moon-mole', 'Moon Mole', 'CHARACTER', 'X', '2024-04-02', null, 0.78, 'crypto-mascots', {
    stem: 'Moon Mole', desc: 'A mole in a space helmet who digs “to the moon” and keeps hitting rock.',
    traits: { visual: 'Mole in a fishbowl helmet', format: 'Mascot drawings', audience: 'Crypto Twitter', tone: 'Self-deprecating', symbols: 'Helmet · shovel · rock', token: 'None', character: 'An optimist who keeps digging' },
    ev: [['reference', 'Earliest post in the sample archive']],
    grow: { n: 10, from: '2024-05-01', to: '2026-10-12', chain: 0.4 }
  });

  // REACTION FORMATS — The Long Exhale
  N('the-long-exhale', 'The Long Exhale', 'VIDEO', 'YOUTUBE', '2017-04-18', null, 0.85, 'reaction-formats', {
    handle: 'stock clip 4481', stem: 'Long Exhale', aliases: ['exhale guy', 'long exhale'],
    desc: 'A stock-footage clip of a man at a desk exhaling for nine seconds.',
    traits: { visual: 'Man at an office desk, beige light', format: 'Stock footage clip', audience: 'Video editors', tone: 'Weary', symbols: 'The exhale · the desk', token: 'None', character: 'An anonymous tired office worker' },
    ev: [['reference', 'Stock library listing predates all uses']]
  });
  N('exhale-gif', 'Exhale.gif', 'MEME', 'TUMBLR', '2017-09-02', 'the-long-exhale', 0.9, 'reaction-formats', {
    stem: 'Exhale', desc: 'Three seconds of the clip, looped, posted as a reply to bad news.',
    traits: { format: 'Reaction GIF', audience: 'Tumblr reblog chains', tone: 'Resigned' },
    ev: [['media', 'Frames match the stock clip'], ['caption', 'Tagged #long exhale']],
    grow: { n: 32, from: '2017-10-01', to: '2026-08-01', chain: 0.8 }
  });
  N('exhale-scale', 'The Exhale Scale', 'FORMAT', 'X', '2019-03-11', 'the-long-exhale', 0.77, 'reaction-formats', {
    stem: 'Exhale Scale', desc: 'A 1–10 chart rating bad news by the length of the exhale it deserves.',
    traits: { format: 'Rating chart', visual: 'Ten stills in a row', tone: 'Dry' },
    ev: [['media', 'Stills from the clip'], ['caption', 'Title references “the long exhale”']],
    grow: { n: 10, from: '2019-04-01', to: '2024-06-01', chain: 0.5 }
  });
  N('side-eye-owl', 'Side-Eye Owl', 'MEME', 'REDDIT', '2016-11-20', null, 0.83, 'reaction-formats', {
    stem: 'Side-Eye Owl', desc: 'An owl photographed mid-turn, looking at the camera sideways.',
    traits: { visual: 'Owl, head half-turned', format: 'Reaction image', audience: 'Forum regulars', tone: 'Suspicious', symbols: 'The side-eye', token: 'None', character: 'An owl who doesn’t believe you' },
    ev: [['reference', 'Earliest post in the sample archive']],
    grow: { n: 20, from: '2017-01-01', to: '2025-11-01', chain: 0.6 }
  });

  // POLITICAL MEMES — fictional, non-partisan
  N('empty-podium', 'The Empty Podium', 'EVENT', 'YOUTUBE', '2020-09-17', null, 0.89, 'political-memes', {
    handle: 'sample livestream archive', stem: 'Empty Podium',
    desc: 'A livestream in which a press-conference podium stood empty for 41 minutes before the feed was cut.',
    traits: { visual: 'Empty podium, blue curtain', format: 'Livestream', audience: 'News watchers', tone: 'Awkward suspense', symbols: 'The podium · the timer', token: 'None', character: 'Nobody' },
    ev: [['reference', 'Stream archive timestamp']]
  });
  N('forty-one-minutes', '41 Minutes', 'NARRATIVE', 'X', '2020-09-18', 'empty-podium', 0.88, 'political-memes', {
    stem: '41 Minutes', desc: 'A running joke: any delay is “41 minutes.”',
    traits: { format: 'Catchphrase', audience: 'Politics Twitter', tone: 'Wry' },
    ev: [['reference', 'Quotes the stream length'], ['caption', 'Screenshots of the timer']]
  });
  N('podium-waiting', 'Podium Waiting', 'FORMAT', 'X', '2020-09-19', 'empty-podium', 0.93, 'political-memes', {
    stem: 'Podium', desc: 'A template: “me waiting for ___” over the empty podium.',
    traits: { format: 'Caption template', tone: 'Impatient', audience: 'Meme accounts' },
    ev: [['media', 'Still from the stream'], ['caption', '“me waiting for…”']],
    grow: { n: 12, from: '2020-10-01', to: '2024-11-01', chain: 0.45 }
  });
  N('podium-cam', 'Podium Cam', 'COMMUNITY', 'REDDIT', '2021-01-08', 'empty-podium', 0.7, 'political-memes', {
    stem: 'Podium Cam', desc: 'A forum that posts empty podiums from around the world.',
    traits: { format: 'Photo forum', audience: 'Collectors', tone: 'Deadpan' },
    ev: [['community', 'Sidebar mentions “the 41 minutes”'], ['caption', 'First post: “in honour of the stream”']],
    grow: { n: 6, from: '2021-02-01', to: '2024-03-01', chain: 0.3 }
  });
  N('ballot-duck', 'Ballot Duck', 'CHARACTER', 'INSTAGRAM', '2022-10-30', null, 0.81, 'political-memes', {
    stem: 'Ballot Duck', desc: 'A rubber duck wearing a “counted” sticker, posted to say “I voted.”',
    traits: { visual: 'Yellow rubber duck with a sticker', format: 'Photo', audience: 'First-time voters', tone: 'Cheerful civic', symbols: 'The sticker', token: 'None', character: 'A duck who votes' },
    ev: [['reference', 'Earliest post in the sample archive']],
    grow: { n: 10, from: '2022-11-01', to: '2026-06-01', chain: 0.35 }
  });

  // GAME MEMES — Lantern Glitch
  N('lantern-glitch', 'Lantern Glitch', 'VIDEO', 'TWITCH', '2017-11-03', null, 0.9, 'game-memes', {
    handle: 'speedrun VOD (sample)', stem: 'Lantern',
    desc: 'A speedrunner falls through the floor while holding a lantern and lands in the final room.',
    traits: { visual: 'Dark dungeon, a lantern falling', format: 'Stream clip', audience: 'Speedrunners', tone: 'Disbelief', symbols: 'The lantern · the floor', token: 'None', character: 'A runner who got lucky' },
    ev: [['reference', 'VOD timestamp predates all uploads']]
  });
  N('lantern-percent', 'Lantern%', 'COMMUNITY', 'DISCORD', '2018-01-20', 'lantern-glitch', 0.95, 'game-memes', {
    stem: 'Lantern%', desc: 'A speedrun category built around the glitch.',
    traits: { format: 'Speedrun category', audience: 'Routers and runners', tone: 'Competitive' },
    ev: [['reference', 'Category rules cite the clip'], ['crosslink', 'Leaderboard links the VOD']],
    grow: { n: 12, from: '2018-02-01', to: '2025-09-01', chain: 0.6 }
  });
  N('floor-is-optional', 'Floor Is Optional', 'MEME', 'REDDIT', '2018-02-14', 'lantern-glitch', 0.84, 'game-memes', {
    stem: 'Floor Is Optional', desc: 'A caption for any clip of something clipping through the world.',
    traits: { format: 'Caption meme', audience: 'Gaming subreddits', tone: 'Smug' },
    ev: [['caption', 'First use under the Lantern clip'], ['community', 'Credited in the thread']],
    grow: { n: 10, from: '2018-03-01', to: '2025-01-01', chain: 0.4 }
  });
  N('lantern-knight', 'Lantern Knight', 'CHARACTER', 'YOUTUBE', '2020-07-22', 'lantern-glitch', 0.62, 'game-memes', {
    stem: 'Lantern Knight', desc: 'An indie game hero who falls through floors on purpose. The designer cites “a clip.”',
    traits: { visual: 'Pixel knight with a lantern', format: 'Indie game', audience: 'Indie players', character: 'A knight who falls on purpose' },
    ev: [['community', 'Devlog mentions “that lantern clip”'], ['caption', 'Trailer title nods to the glitch']],
    grow: { n: 8, from: '2020-08-01', to: '2026-03-01', chain: 0.4 }
  });
  N('respawn-bench', 'Respawn Bench', 'MEME', 'X', '2019-05-26', null, 0.8, 'game-memes', {
    stem: 'Respawn Bench', desc: 'A photo of a real park bench captioned “checkpoint reached.”',
    traits: { visual: 'Park bench, golden hour', format: 'Captioned photo', audience: 'Gamers outdoors', tone: 'Relieved', symbols: 'The bench', token: 'None', character: 'None' },
    ev: [['reference', 'Earliest post in the sample archive']],
    grow: { n: 12, from: '2019-06-01', to: '2025-08-01', chain: 0.4 }
  });

  /* ---------------- DOCUMENTED lineages (real, 2007–2026, curated from public reporting) ----------------
     Dates marked approx: 'month' | 'year' are approximate; reported: true means "first reported on". */
  const SRC = {
    kymJP: ['Know Your Meme — Who is Jean Philanthrope?', 'https://trending.knowyourmeme.com/editorials/guides/who-is-jean-philanthrope-and-is-he-ai-the-mysterious-frenchman-named-jean-phil-shadowboxing-across-social-media-explained'],
    egJP: ['EarlyGame — This influencer doesn’t exist', 'https://earlygame.com/news/entertainment/this-influencer-doesnt-exist-jean-phil-leaves-the-internet-fooled'],
    vrtJP: ['VRT NWS — Jean Philanthrope', 'https://www.vrt.be/vrtnws/nl/2026/10/08/jean-philanthrope-ai-influencer/'],
    kapJP: ['Kapwing — How to make Jean Philanthrope AI videos', 'https://www.kapwing.com/resources/how-to-make-jean-philanthrope-ai-videos/'],
    pen: ['Wikipedia — Nihilistic penguin', 'https://en.wikipedia.org/wiki/Nihilistic_penguin'],
    nc: ['NapoleonCat — Trending memes', 'https://napoleoncat.com/blog/trending-memes/'],
    s67: ['Wikipedia — Doot Doot (6 7)', 'https://en.wikipedia.org/wiki/Doot_Doot_(6_7)'],
    ib: ['Wikipedia — Italian brainrot', 'https://en.wikipedia.org/wiki/Italian_brainrot'],
    cg: ['Wikipedia — Chill Guy', 'https://en.wikipedia.org/wiki/Chill_Guy'],
    md: ['Wikipedia — Moo Deng', 'https://en.wikipedia.org/wiki/Moo_Deng']
  };
  function R(id, name, type, platform, date, parent, conf, family, o) {
    const src = (o.src || []).map(k => SRC[k]);
    N(id, name, type, platform, date, parent, conf, family, Object.assign({ doc: true, sources: src, stem: name }, o));
  }

  // Jean Philanthrope — AI-assisted character, Sept 2026
  R('jean-philanthrope', 'Jean Philanthrope', 'CHARACTER', 'INSTAGRAM', '2026-09-17', null, 0.9, 'ai-celebrities', {
    handle: '@jean_philanthrope', aliases: ['jean phil', 'jeanphil', 'jean-phil', 'poodle man'], src: ['kymJP', 'vrtJP', 'egJP'],
    desc: 'A wordless “Frenchman” shadowboxing in apartments, parks and cafés. Widely reported as AI-generated; the anonymous creator told VRT that AI plays a role and that the account is run between Brussels and Paris.',
    traits: { visual: 'Curly-haired man shadowboxing in Paris streets', format: 'Short vertical clips', audience: 'Instagram Reels', tone: 'Deadpan swagger', symbols: 'Shadowboxing · Paris · espresso and croissant', token: 'None', character: 'Silent French boxer of unclear reality' },
    ev: [['reference', 'Earliest known video posted to Instagram on 17 Sep 2026 (Know Your Meme)']]
  });
  R('jp-dilemma', 'Park boxing to “Dilemma”', 'VIDEO', 'TIKTOK', '2026-09-19', 'jean-philanthrope', 0.95, 'ai-celebrities', {
    src: ['kymJP'], desc: 'Shadowboxing under a tree in a Paris park, set to Nelly’s “Dilemma.” The clip that carried him onto TikTok.',
    traits: { visual: 'Paris park, under a tree', format: 'Shadowboxing clip set to a hit song', audience: 'TikTok For You page', symbols: 'Nelly’s “Dilemma”' },
    ev: [['reference', 'Posted by the character’s own TikTok account'], ['media', 'Same character and boxing routine']]
  });
  R('jp-finis', 'Street boxing to “FINIS-LES”', 'VIDEO', 'TIKTOK', '2026-09-19', 'jean-philanthrope', 0.95, 'ai-celebrities', {
    src: ['kymJP'], desc: 'Shadowboxing on a street to French rapper La Fève’s “FINIS-LES.”',
    traits: { visual: 'Paris street at night', format: 'Shadowboxing clip set to French rap', audience: 'French rap TikTok' },
    ev: [['reference', 'Posted by the character’s own account'], ['media', 'Same routine, new location']]
  });
  R('jp-ai-rap', 'AI rap video edit', 'VIDEO', 'X', '2026-09-20', 'jean-philanthrope', 0.9, 'ai-celebrities', {
    handle: '@sinx7z', src: ['kymJP'], desc: 'An X user generated a music video that places Jean Phil inside a rap video.',
    traits: { visual: 'AI-rendered rap music-video set', format: 'Fan-made AI music video', audience: 'X edit accounts', tone: 'Hype', character: 'Jean Phil as a rapper' },
    ev: [['caption', 'Credits the character by name'], ['media', 'Uses his likeness']]
  });
  R('jp-spiderman', 'Spider-Man edit', 'VIDEO', 'INSTAGRAM', '2026-09-24', 'jp-ai-rap', 0.8, 'ai-celebrities', {
    handle: 'filcrow', reported: true, src: ['kymJP'], desc: 'An AI edit dropping him into the Mary Jane catch scene from Spider-Man.',
    traits: { visual: 'Spider-Man film scene', format: 'AI movie-scene insert', character: 'Jean Phil as a superhero stand-in' },
    ev: [['media', 'Same likeness'], ['community', 'Grouped with the AI edits by Know Your Meme']]
  });
  R('jeanphil-token', '$JEANPHIL', 'TOKEN', 'ONCHAIN', '2026-09-20', 'jean-philanthrope', 0.88, 'crypto-mascots', {
    ticker: '$JEANPHIL', src: ['kymJP', 'egJP', 'vrtJP'],
    desc: 'A Solana token launched on pump.fun, promoted by the character’s X account and linked from his Instagram bio. Coverage warned about pump-and-dump risk.',
    traits: { visual: 'Character portrait as token logo', format: 'Fungible token', audience: 'Meme-coin traders', tone: 'Promotional', token: 'Ticker $JEANPHIL (Solana, pump.fun)', character: 'Character as mascot' },
    ev: [['crosslink', 'Instagram bio linked the token (Know Your Meme)'], ['reference', 'X account promoted it on 20 Sep 2026']]
  });
  R('jp-renaissance', 'Renaissance painting boxing', 'VIDEO', 'INSTAGRAM', '2026-09-21', 'jean-philanthrope', 0.95, 'ai-celebrities', {
    src: ['kymJP'], desc: 'Shadowboxing in front of a Renaissance painting, set to “Praise God.”',
    traits: { visual: 'Museum wall, Renaissance painting', symbols: '“Praise God”' }, ev: [['reference', 'Posted by the character’s account']]
  });
  R('jp-cafe', 'Café, espresso and croissant', 'VIDEO', 'INSTAGRAM', '2026-09-21', 'jean-philanthrope', 0.95, 'ai-celebrities', {
    src: ['kymJP'], desc: 'A café clip with espresso and a croissant that spread across TikTok and X.',
    traits: { visual: 'Parisian café table', tone: 'Smug calm', symbols: 'Espresso · croissant' }, ev: [['reference', 'Posted by the character’s account']]
  });
  R('jp-isthisai', '“Is he AI?” threads', 'NARRATIVE', 'REDDIT', '2026-09-21', 'jean-philanthrope', 0.9, 'ai-celebrities', {
    handle: 'r/isthisAI', src: ['kymJP'], desc: 'A Reddit thread asking whether he is AI-generated meme-coin promotion; an X user had already claimed so the day before.',
    traits: { visual: 'Screenshots and frame-by-frame crops', format: 'Debunk thread', audience: 'AI-detection communities', tone: 'Suspicious' },
    ev: [['reference', 'Thread names the account'], ['community', 'Hundreds of replies within a day (Know Your Meme)']]
  });
  R('jp-jeremy', '@jeremyfindsai breakdown', 'VIDEO', 'WEB', '2026-09-24', 'jp-isthisai', 0.75, 'ai-celebrities', {
    reported: true, src: ['kymJP'], desc: 'A creator’s video concluding the character is not a real person and part of a pump-and-dump, as summarised by Know Your Meme.',
    traits: { format: 'Explainer video', tone: 'Investigative', audience: 'AI-literacy followers' },
    ev: [['reference', 'Analyses the Jean Phil account'], ['community', 'Cited in the same Know Your Meme guide']]
  });
  R('archibald-brown', 'Archibald Brown', 'CHARACTER', 'WEB', '2026-09-24', 'jean-philanthrope', 0.85, 'ai-celebrities', {
    reported: true, src: ['kymJP', 'egJP'], desc: 'An English counterpart presented as Jean Phil’s rival, with its own meme coin.',
    traits: { visual: 'British gentleman counterpart', format: 'AI persona account', character: 'The rival from across the Channel' },
    ev: [['reference', 'Framed as Jean Phil’s rival'], ['community', 'Reported by Know Your Meme and EarlyGame']]
  });
  R('archibald-coin', 'Archibald Brown coin', 'TOKEN', 'ONCHAIN', '2026-09-25', 'archibald-brown', 0.75, 'crypto-mascots', {
    reported: true, approx: 'month', src: ['kymJP'], desc: 'The rival character’s own meme coin. Ticker and launch date not reported.',
    traits: { format: 'Fungible token', audience: 'Meme-coin traders', tone: 'Promotional', token: 'Meme coin (ticker not reported)' },
    ev: [['reference', 'Mentioned alongside the character']]
  });
  R('derek-mercer', 'Derek Mercer', 'CHARACTER', 'WEB', '2026-09-29', 'jean-philanthrope', 0.65, 'ai-celebrities', {
    reported: true, src: ['egJP'], desc: 'A copycat character following the same concept, reported by EarlyGame.',
    traits: { format: 'AI persona account', character: 'Another fictional influencer' },
    ev: [['community', 'Listed as a follower of the concept'], ['counter', 'No direct reference to Jean Phil documented']]
  });
  R('jp-tutorials', 'How-to-make-Jean-Phil guides', 'FORMAT', 'WEB', '2026-10-01', 'jean-philanthrope', 0.85, 'ai-celebrities', {
    approx: 'month', src: ['kapJP'], desc: 'Editing tools publish step-by-step guides for generating your own Jean Phil-style videos.',
    traits: { format: 'Tutorial and template', audience: 'Creators copying the format', tone: 'Instructional' },
    ev: [['reference', 'Guide is titled after the character']]
  });
  R('jp-companions', 'AI companion dancers', 'FORMAT', 'WEB', '2026-10-10', 'jean-philanthrope', 0.8, 'ai-celebrities', {
    reported: true, src: ['vrtJP'], desc: 'Other accounts create their own AI characters that dance alongside Jean Phil, with mixed success (VRT).',
    traits: { format: 'Duet with an AI character', character: 'New AI characters beside him' },
    ev: [['reference', 'Videos feature Jean Phil next to new characters']]
  });

  // Nihilistic penguin — 2007 film scene → 2026 meme
  R('herzog-penguin', 'Herzog’s deserting penguin', 'VIDEO', 'TV', '2007-09-01', null, 0.95, 'viral-animals', {
    approx: 'year', src: ['pen'], aliases: ['encounters at the end of the world'],
    desc: 'In Werner Herzog’s 2007 documentary Encounters at the End of the World, an Adélie penguin leaves its colony and walks toward the mountains.',
    traits: { visual: 'Lone Adélie penguin walking inland', format: 'Documentary scene', audience: 'Documentary viewers', tone: 'Bleak, philosophical', symbols: 'The mountains · leaving the colony', token: 'None', character: 'A penguin walking toward certain death' },
    ev: [['reference', 'Scene from the 2007 film']]
  });
  R('nihilistic-penguin', 'Nihilistic penguin', 'MEME', 'TIKTOK', '2026-01-10', 'herzog-penguin', 0.92, 'viral-animals', {
    approx: 'month', src: ['pen', 'nc'], aliases: ['penguin meme', 'walking penguin'],
    desc: 'The clip, often paired with an organ cover of “L’Amour toujours,” recast as walking away from the noise, the pack or the 9-to-5.',
    traits: { format: 'Reaction clip with organ music', audience: 'TikTok, Instagram and X', tone: 'Anti-conformist', symbols: 'Walking away · organ “L’Amour toujours”', character: 'A penguin who quits' },
    ev: [['media', 'Footage cut from the film'], ['caption', 'Captions name the documentary']]
  });
  R('greenland-penguin', 'Greenland penguin image', 'POST', 'TRUTH', '2026-01-23', 'nihilistic-penguin', 0.95, 'political-memes', {
    src: ['pen'], desc: 'An AI-generated image mimicking the meme, posted by Donald Trump on Truth Social during the Greenland dispute: he walks beside a penguin carrying US and Greenlandic flags.',
    traits: { visual: 'AI image: man and penguin with flags', format: 'Political AI image', audience: 'Political media', tone: 'Political', character: 'Penguin as a symbol of Greenland' },
    ev: [['reference', 'Reported as mimicking the meme (Wikipedia)'], ['press', 'Covered by Gulf News and Corriere della Sera']]
  });
  R('xinhua-penguin', 'Xinhua reply video', 'VIDEO', 'NEWS', '2026-01-25', 'greenland-penguin', 0.85, 'political-memes', {
    src: ['pen'], desc: 'Chinese journalists answered with an AI video of Uncle Sam dragging an exhausted penguin, noting penguins don’t live in the Arctic.',
    traits: { visual: 'AI video: Uncle Sam and a penguin', format: 'State-media response video', tone: 'Mocking' },
    ev: [['reference', 'Response to the Greenland image'], ['press', 'Reported 25 Jan 2026']]
  });
  R('penguin-brands', 'Brand penguin posts', 'FORMAT', 'INSTAGRAM', '2026-02-05', 'nihilistic-penguin', 0.8, 'viral-animals', {
    approx: 'month', src: ['nc', 'pen'], desc: 'Brands including BMW, Lidl and FC Barcelona adopted the walking penguin in promotions.',
    traits: { format: 'Brand marketing post', audience: 'Brand followers', tone: 'Playful marketing' },
    ev: [['press', 'Listed by NapoleonCat and Wikipedia'], ['media', 'Reuse the penguin scene']]
  });

  // 6-7 — Skrilla’s “Doot Doot (6 7)”
  R('doot-doot', 'Doot Doot (6 7)', 'SOUND', 'WEB', '2024-12-15', null, 0.9, 'brainrot', {
    approx: 'month', handle: 'Skrilla', src: ['s67'], aliases: ['6 7', '6-7', '67', 'six seven'],
    desc: 'A drill track by Skrilla, unofficially released in December 2024. Its “6-7” line became the meme.',
    traits: { visual: 'None; audio first', format: 'Drill track', audience: 'Rap listeners', tone: 'Menacing', symbols: '“6-7”', token: 'None', character: 'None' },
    ev: [['reference', 'Song credits (Priority Records)']]
  });
  R('lamelo-67', 'LaMelo Ball edits', 'VIDEO', 'TIKTOK', '2025-02-04', 'doot-doot', 0.9, 'brainrot', {
    reported: true, src: ['s67'], desc: 'Edits of basketball player LaMelo Ball, who is 6′7″, set to the song.',
    traits: { visual: 'Basketball highlights', format: 'Sports edit', audience: 'Sports TikTok', tone: 'Hype', symbols: '6′7″' },
    ev: [['media', 'Uses the song audio'], ['press', 'Daily Dot explainer, 4 Feb 2025']]
  });
  R('classroom-67', '“6-7” in classrooms', 'MEME', 'IRL', '2025-08-13', 'lamelo-67', 0.85, 'brainrot', {
    reported: true, src: ['s67'], desc: 'Kids shout “six-seven” at any number; the Wall Street Journal reported trouble for maths teachers.',
    traits: { visual: 'Hand gesture, weighing palms', format: 'Spoken slang', audience: 'School kids', tone: 'Absurdist', symbols: '“6-7” and the hand gesture' },
    ev: [['press', 'Arizona Republic, 13 Aug 2025'], ['press', 'Wall Street Journal, 14 Oct 2025']]
  });
  R('woty-67', 'Dictionary.com Word of the Year', 'EVENT', 'WEB', '2025-10-29', 'classroom-67', 0.95, 'brainrot', {
    src: ['s67'], desc: 'Dictionary.com named “67” its Word of the Year for 2025.',
    traits: { format: 'Institutional recognition', audience: 'General public', tone: 'Bemused' }, ev: [['press', 'Announced 29 Oct 2025']]
  });
  R('gta-67', 'GTA VI soundtrack claim', 'EVENT', 'GAME', '2025-10-14', 'doot-doot', 0.6, 'game-memes', {
    reported: true, src: ['s67'], desc: 'Skrilla reportedly said the song will appear in Grand Theft Auto VI, with him appearing as himself.',
    traits: { format: 'Game soundtrack', audience: 'Gamers' }, ev: [['press', 'Reported by WSJ, NME and Stereogum'], ['counter', 'Not confirmed by the publisher']]
  });

  // Italian brainrot
  R('rock-rhymes', 'Rock rhyme memes', 'MEME', 'TIKTOK', '2023-10-15', null, 0.6, 'brainrot', {
    approx: 'month', src: ['ib'], desc: 'Memes of an actor rhyming about absurd topics, including the phrase “Tralalero tralala.”',
    traits: { visual: 'Celebrity face edits', format: 'Rhyming voice-over', audience: 'Shitpost TikTok', tone: 'Nonsense', symbols: '“tralalero tralala”', token: 'None', character: 'None' },
    ev: [['reference', 'Phrase origin per Wikipedia']]
  });
  R('tralalero', 'Tralalero Tralala', 'CHARACTER', 'TIKTOK', '2025-01-13', 'rock-rhymes', 0.7, 'brainrot', {
    src: ['ib'], aliases: ['italian brainrot', 'shark in nikes'],
    desc: 'An AI-generated shark in sneakers with an Italian voice-over, widely seen as the first Italian brainrot character.',
    traits: { visual: 'AI shark wearing sneakers', format: 'AI image with Italian voice-over', audience: 'Gen Alpha TikTok', tone: 'Absurd, profane', symbols: '“Tralalero tralala”', character: 'A shark in sneakers' },
    ev: [['caption', 'Reuses the phrase'], ['community', 'Creation attributed to a now-banned account']]
  });
  R('tung-sahur', 'Tung Tung Tung Sahur', 'CHARACTER', 'TIKTOK', '2025-02-15', 'tralalero', 0.75, 'brainrot', {
    approx: 'month', handle: '@noxaasht', src: ['ib'], aliases: ['tung tung tung sahur', 'tung tung'],
    desc: 'A wooden figure with a bat, named after the Ramadan wake-up drum call. One of the most widespread characters.',
    traits: { visual: 'Wooden log figure with a bat', symbols: 'Sahur drum call', character: 'A log that wakes you up' },
    ev: [['community', 'Grouped with Italian brainrot characters'], ['caption', 'Same AI-image-plus-chant format']]
  });
  R('fortnite-brainrot', 'Fortnite brainrot skins', 'EVENT', 'GAME', '2026-04-15', 'tung-sahur', 0.95, 'game-memes', {
    approx: 'month', src: ['ib'], desc: 'Tung Tung Tung Sahur and Ballerina Cappuccina were added to Fortnite as skins.',
    traits: { visual: '3D game skins', format: 'Licensed game cosmetics', audience: 'Fortnite players', tone: 'Commercial' },
    ev: [['press', 'Reported April 2026'], ['media', 'Character designs reused']]
  });
  R('sahur-dispute', 'Ownership dispute', 'EVENT', 'NEWS', '2026-08-21', 'tung-sahur', 0.95, 'brainrot', {
    src: ['ib'], desc: 'NPR and GamesBeat reported a copyright dispute between two studios over who owns Tung Tung Tung Sahur.',
    traits: { format: 'Legal dispute', audience: 'Press', tone: 'Legal' }, ev: [['press', 'NPR and GamesBeat, 21 Aug 2026']]
  });
  R('italianrot-coin', 'Italianrot coin', 'TOKEN', 'ONCHAIN', '2025-03-15', 'tralalero', 0.8, 'crypto-mascots', {
    approx: 'month', src: ['ib'], desc: 'A meme coin named after the trend.',
    traits: { format: 'Fungible token', audience: 'Meme-coin traders', tone: 'Promotional', token: 'Meme coin “Italianrot”' }, ev: [['caption', 'Named after the trend']]
  });
  R('bombardiro', 'Bombardiro Crocodilo', 'CHARACTER', 'TIKTOK', '2025-04-10', 'tralalero', 0.75, 'brainrot', {
    approx: 'month', reported: true, src: ['ib'], desc: 'A crocodile-bomber hybrid; drew wide coverage in April 2025.',
    traits: { visual: 'AI crocodile fused with a bomber plane', character: 'A crocodile bomber' }, ev: [['community', 'Same character format']]
  });
  R('ballerina', 'Ballerina Cappuccina', 'CHARACTER', 'TIKTOK', '2025-04-12', 'tralalero', 0.75, 'brainrot', {
    approx: 'month', reported: true, src: ['ib'], desc: 'A ballerina with a cappuccino-cup head.',
    traits: { visual: 'Ballerina with a coffee-cup head', character: 'A dancing cappuccino' }, ev: [['community', 'Same character format']]
  });
  R('skifidol', 'Skifidol trading cards', 'FORMAT', 'IRL', '2025-06-19', 'tralalero', 0.85, 'brainrot', {
    reported: true, src: ['ib'], desc: 'Italian brainrot trading cards on sale at Italian newsstands.',
    traits: { visual: 'Printed trading cards', format: 'Collectible cards', audience: 'Kids in Italy', tone: 'Commercial' }, ev: [['press', 'Corriere della Sera, 19 Jun 2025']]
  });
  R('steal-a-brainrot', 'Steal a Brainrot', 'GAME', 'ROBLOX', '2025-07-25', 'tralalero', 0.85, 'game-memes', {
    reported: true, src: ['ib'], desc: 'A Roblox game built around collecting and stealing brainrot characters.',
    traits: { visual: '3D brainrot characters', format: 'Roblox game', audience: 'Roblox players', tone: 'Competitive' }, ev: [['press', 'Polygon explainer, 25 Jul 2025']]
  });

  // Chill Guy
  R('chill-guy', 'Chill Guy', 'POST', 'X', '2023-10-04', null, 0.85, 'reaction-formats', {
    handle: 'Phillip Banks', src: ['cg', 'nc'], aliases: ['my new character', 'just a chill guy'],
    desc: 'Phillip Banks’s drawing of a laid-back anthropomorphic dog, first titled “My New Character.”',
    traits: { visual: 'Brown dog in a grey sweater and jeans, hands in pockets', format: 'Single illustration', audience: 'Illustration followers', tone: 'Laid-back', symbols: 'Hands in pockets · smirk', token: 'None', character: 'A guy who does not care' },
    ev: [['reference', 'Posted by the artist, 4 Oct 2023']]
  });
  R('unchill-gal', 'Unchill Gal', 'CHARACTER', 'X', '2023-12-01', 'chill-guy', 0.9, 'reaction-formats', {
    approx: 'month', src: ['cg'], desc: 'The artist’s companion piece, also called “My old character.”',
    traits: { character: 'The anxious counterpart' }, ev: [['reference', 'Made by the same artist']]
  });
  R('chill-slideshow', 'TikTok slideshow', 'VIDEO', 'TIKTOK', '2024-08-30', 'chill-guy', 0.9, 'reaction-formats', {
    handle: '.blitzerzz', src: ['cg'], desc: 'A TikTok slideshow using the artwork goes viral and names the format.',
    traits: { format: 'Slideshow: “just a chill guy”', audience: 'TikTok', tone: 'Self-mocking' }, ev: [['media', 'Uses the original artwork']]
  });
  R('chill-dexter', 'Dexter-quote edit', 'VIDEO', 'TIKTOK', '2024-09-04', 'chill-slideshow', 0.85, 'reaction-formats', {
    src: ['cg'], desc: 'An edit pairing the dog with a Dexter quote, reposted the next day to a much larger audience.',
    traits: { format: 'Quote edit', symbols: 'Dexter voice-over' }, ev: [['media', 'Same artwork'], ['caption', 'Same caption format']]
  });
  R('chill-girl', 'Chill Girl', 'CHARACTER', 'TIKTOK', '2024-11-17', 'chill-slideshow', 0.9, 'reaction-formats', {
    handle: 'Stopscrolling_22', src: ['cg'], desc: 'A long-haired version that started a new wave of memes.',
    traits: { visual: 'The dog with long hair', character: 'The chill girl' }, ev: [['media', 'Modified artwork']]
  });
  R('chillguy-token', '$CHILLGUY', 'TOKEN', 'ONCHAIN', '2024-11-15', 'chill-guy', 0.95, 'crypto-mascots', {
    ticker: '$CHILLGUY', src: ['cg'], desc: 'A Solana meme coin made by anonymous creators without the artist’s permission.',
    traits: { format: 'Fungible token', audience: 'Meme-coin traders', tone: 'Promotional', token: 'Ticker $CHILLGUY (Solana)', character: 'Dog as mascot' },
    ev: [['media', 'Uses the artwork'], ['counter', 'The artist did not authorise it']]
  });
  R('banks-takedowns', 'Copyright takedowns', 'EVENT', 'X', '2024-11-21', 'chillguy-token', 0.95, 'reaction-formats', {
    src: ['cg'], desc: 'Banks announced he had copyrighted the artwork and issued takedowns against unauthorised merch and crypto projects, while leaving trend posts alone.',
    traits: { format: 'Legal notice', audience: 'Crypto and merch sellers', tone: 'Legal' }, ev: [['reference', 'Artist’s own announcement']]
  });
  R('chill-plush', 'Youtooz plush', 'FORMAT', 'IRL', '2024-12-25', 'chill-guy', 0.85, 'reaction-formats', {
    reported: true, src: ['cg'], desc: 'A licensed plush toy line.',
    traits: { visual: 'Vinyl and plush figure', format: 'Licensed merch', audience: 'Collectors', tone: 'Commercial' }, ev: [['press', 'Covered 25 Dec 2024']]
  });
  R('chill-41', '“Chill Guy” by 41', 'SOUND', 'WEB', '2025-04-15', 'chill-guy', 0.85, 'reaction-formats', {
    approx: 'month', src: ['cg'], desc: 'A song by hip-hop group 41 named after the artwork.',
    traits: { format: 'Rap single', audience: 'Hip-hop listeners' }, ev: [['caption', 'Title names the meme']]
  });

  // Moo Deng
  R('moo-deng', 'Moo Deng', 'POST', 'FACEBOOK', '2024-09-02', null, 0.9, 'viral-animals', {
    approx: 'month', src: ['md'], aliases: ['moodeng', 'baby hippo'],
    desc: 'Photos of a pygmy hippo born on 10 Jul 2024 at Khao Kheow Open Zoo, Thailand, posted by the zoo’s official accounts.',
    traits: { visual: 'Wet baby pygmy hippo, mid-bite', format: 'Zoo photo posts', audience: 'Animal-lover feeds', tone: 'Chaotic-cute', symbols: 'The bite · the splash', token: 'None', character: 'A tiny furious hippo' },
    ev: [['reference', 'Zoo’s official posts (Wikipedia)']]
  });
  R('moo-deng-snl', 'SNL Weekend Update bit', 'VIDEO', 'TV', '2024-09-28', 'moo-deng', 0.95, 'viral-animals', {
    src: ['md'], desc: 'Bowen Yang played Moo Deng on Saturday Night Live’s Weekend Update.',
    traits: { visual: 'Comedian in a hippo costume', format: 'TV sketch', audience: 'SNL viewers', tone: 'Satirical' }, ev: [['press', 'Broadcast 28 Sep 2024']]
  });
  R('moo-deng-song', '“Moodeng Moodeng!”', 'SOUND', 'YOUTUBE', '2024-11-13', 'moo-deng', 0.95, 'viral-animals', {
    reported: true, src: ['md'], desc: 'The official theme song in four languages, released with GMM Grammy.',
    traits: { format: 'Official theme song', audience: 'Families', tone: 'Cheerful' }, ev: [['press', 'AP coverage, 13 Nov 2024']]
  });
  R('moo-deng-election', 'Election fruit pick', 'VIDEO', 'FACEBOOK', '2024-11-04', 'moo-deng', 0.9, 'political-memes', {
    approx: 'month', src: ['md'], desc: 'A zoo video showing Moo Deng choosing between fruit dishes engraved with US candidates’ names.',
    traits: { format: 'Animal prediction video', audience: 'Election watchers', tone: 'Playful' }, ev: [['reference', 'Posted by the zoo']]
  });
  R('moo-deng-doodle', 'Google Year in Search cameo', 'EVENT', 'WEB', '2024-12-10', 'moo-deng', 0.9, 'viral-animals', {
    approx: 'month', src: ['md'], desc: 'Appeared in Google’s 2024 year-in-review video.',
    traits: { format: 'Platform recap', audience: 'General public' }, ev: [['press', 'December 2024']]
  });
  R('moo-deng-birthday', 'First birthday', 'EVENT', 'IRL', '2025-07-10', 'moo-deng', 0.9, 'viral-animals', {
    src: ['md'], desc: 'More than 12,000 fans visited the zoo for her first birthday.',
    traits: { format: 'Fan event', audience: 'Zoo visitors', tone: 'Celebratory' }, ev: [['press', 'Reported 10 Jul 2025']]
  });

  // 2026 fresh formats (NapoleonCat roundup)
  R('ted2-line', 'Ted 2 “grr” line', 'VIDEO', 'TV', '2015-06-26', null, 0.6, 'reaction-formats', {
    approx: 'year', src: ['nc'], desc: 'A line from the 2015 film Ted 2 that the Grr Mondays format borrows.',
    traits: { visual: 'Film still', format: 'Film scene', audience: 'Moviegoers', tone: 'Crude comedy', symbols: '“grr”', token: 'None', character: 'Ted' },
    ev: [['reference', 'Named as the source line by NapoleonCat']]
  });
  R('grr-mondays', '#GrrMondays', 'FORMAT', 'TIKTOK', '2026-09-07', 'ted2-line', 0.7, 'reaction-formats', {
    approx: 'month', src: ['nc'], aliases: ['grr mondays'], desc: 'People post their real, unflattering Mondays under #GrrMondays.',
    traits: { visual: 'Unfiltered phone footage', format: 'Hashtag diary post', audience: 'Office-worker TikTok', tone: 'Grumpy, relatable', symbols: '#GrrMondays', character: 'You, on a Monday' },
    ev: [['caption', 'Borrows the Ted 2 line'], ['community', 'Listed as October’s trending meme']]
  });
  R('grr-animations', 'Grr Mondays animations', 'VIDEO', 'TIKTOK', '2026-09-24', 'grr-mondays', 0.75, 'reaction-formats', {
    approx: 'month', reported: true, src: ['nc'], desc: 'Animated versions of the format.', traits: { visual: 'Animation', format: 'Animated short' }, ev: [['caption', 'Same hashtag']]
  });
  R('grr-forecasts', 'Fake Monday weather forecasts', 'VIDEO', 'TIKTOK', '2026-10-03', 'grr-mondays', 0.75, 'reaction-formats', {
    approx: 'month', reported: true, src: ['nc'], desc: 'Mock weather reports for the week’s mood.', traits: { format: 'Mock forecast', tone: 'Deadpan' }, ev: [['caption', 'Same hashtag']]
  });
  R('grr-notes', 'Instagram Notes screenshots', 'POST', 'INSTAGRAM', '2026-10-06', 'grr-mondays', 0.75, 'reaction-formats', {
    approx: 'month', reported: true, src: ['nc'], desc: 'Screenshots of Monday complaints in Instagram Notes.', traits: { visual: 'Notes UI screenshot', format: 'Screenshot meme' }, ev: [['caption', 'Same hashtag']]
  });
  R('jimothy', 'Jimothy the raccoon', 'POST', 'NEWS', '2026-08-12', null, 0.8, 'viral-animals', {
    approx: 'month', src: ['nc'], aliases: ['jimothy'], desc: 'A wild raccoon in Seattle’s Ballard neighbourhood, covered by local TV news.',
    traits: { visual: 'Raccoon on a Ballard street', format: 'Local news footage', audience: 'Seattle locals', tone: 'Wholesome', symbols: 'The raccoon · Ballard', token: 'None', character: 'A neighbourhood raccoon' },
    ev: [['press', 'ABC News, ABC7 and KING 5 coverage']]
  });
  R('jimothy-moods', 'Jimothy mood captions', 'MEME', 'INSTAGRAM', '2026-08-25', 'jimothy', 0.8, 'viral-animals', {
    approx: 'month', reported: true, src: ['nc'], desc: 'His footage captioned as a mood.', traits: { format: 'Captioned clip', audience: 'Meme pages', tone: 'Relatable' }, ev: [['media', 'News footage reused']]
  });
  R('jimothy-coworker', 'Jimothy, small business owner', 'FORMAT', 'INSTAGRAM', '2026-09-15', 'jimothy-moods', 0.75, 'viral-animals', {
    approx: 'month', reported: true, src: ['nc'], desc: 'Captions casting him as a coworker, a Monday or a small business owner.', traits: { format: 'Role caption', character: 'Raccoon with a job' }, ev: [['caption', 'Same footage, new role']]
  });

  // Doge — Kabosu, 2010 → Dogecoin → D.O.G.E.
  SRC.doge = ['Wikipedia — Doge (meme)', 'https://en.wikipedia.org/wiki/Doge_(meme)'];
  SRC.pepe = ['Wikipedia — Pepe the Frog', 'https://en.wikipedia.org/wiki/Pepe_the_Frog'];
  R('kabosu', 'Kabosu photo', 'POST', 'WEB', '2010-02-23', null, 0.92, 'viral-animals', {
    approx: 'year', handle: 'Atsuko Sato’s blog', src: ['doge'], aliases: ['kabosu', 'doge dog', 'shiba'],
    desc: 'A blog photo of Kabosu, a Shiba Inu, glancing sideways from a sofa.',
    traits: { visual: 'Shiba Inu side-eye on a sofa', format: 'Blog photo', audience: 'Pet blog readers', tone: 'Wholesome', symbols: 'The side glance', token: 'None', character: 'A suspicious Shiba' },
    ev: [['reference', 'Posted by the owner in 2010 (Wikipedia)']]
  });
  R('doge', 'Doge', 'MEME', 'TUMBLR', '2013-07-15', 'kabosu', 0.92, 'viral-animals', {
    approx: 'month', src: ['doge'], aliases: ['doge', 'such wow', 'much wow'],
    desc: 'Kabosu’s photo with multicoloured Comic Sans captions — “such wow,” “much amaze.” Know Your Meme’s top meme of 2013.',
    traits: { visual: 'Kabosu with Comic Sans captions', format: 'Image macro', audience: 'Tumblr and Reddit', tone: 'Broken-English deadpan', symbols: 'Comic Sans · “such wow”', character: 'An inner-monologue dog' },
    ev: [['media', 'Same photo'], ['community', 'Spammed on 4chan in Aug 2013']]
  });
  R('dogecoin', 'Dogecoin', 'TOKEN', 'ONCHAIN', '2013-12-06', 'doge', 0.95, 'crypto-mascots', {
    approx: 'month', ticker: '$DOGE', src: ['doge'], desc: 'Launched in December 2013; described as the first cryptocurrency based on an internet meme.',
    traits: { visual: 'Doge face on a coin', format: 'Cryptocurrency', audience: 'Crypto hobbyists', tone: 'Joke turned serious', token: 'Ticker $DOGE', character: 'Doge as mascot' },
    ev: [['media', 'Uses the Doge face'], ['reference', 'Named after the meme']]
  });
  R('doge-nascar', 'Dogecar sponsorship', 'EVENT', 'IRL', '2014-04-15', 'dogecoin', 0.9, 'crypto-mascots', {
    approx: 'month', src: ['doge'], desc: 'The Dogecoin community sponsored NASCAR driver Josh Wise’s car.',
    traits: { visual: 'Doge-livery race car', format: 'Sponsorship', audience: 'NASCAR fans' }, ev: [['reference', 'Funded by the coin’s community']]
  });
  R('doge-weather', 'Doge Weather', 'FORMAT', 'WEB', '2014-01-15', 'doge', 0.85, 'viral-animals', {
    approx: 'month', src: ['doge'], desc: 'A weather site, later an iOS app, that reports the forecast in Doge-speak.',
    traits: { format: 'Weather app', audience: 'App users', tone: 'Playful' }, ev: [['caption', 'Doge-speak captions']]
  });
  R('swole-doge', 'Swole Doge vs. Cheems', 'MEME', 'WEB', '2020-06-01', 'doge', 0.85, 'reaction-formats', {
    approx: 'year', src: ['doge'], desc: 'A muscular Doge set against Cheems, a weaker Shiba with a speech impediment, comparing then and now.',
    traits: { visual: 'Muscular Doge beside a small Shiba', format: 'Comparison template', audience: 'Meme pages', tone: 'Ironic nostalgia', character: 'Strong past vs weak present' },
    ev: [['media', 'Doge-style Shiba drawings'], ['community', 'Grouped with ironic Doge characters']]
  });
  R('doge-nft', 'Doge NFT sale', 'TOKEN', 'ONCHAIN', '2021-06-11', 'kabosu', 0.9, 'crypto-mascots', {
    approx: 'year', src: ['doge'], desc: 'PleasrDAO bought an NFT of the original Kabosu photo.',
    traits: { format: 'NFT', audience: 'Collectors', token: 'NFT of the original photo' }, ev: [['media', 'The original photo']]
  });
  R('nafo', 'NAFO Fellas', 'COMMUNITY', 'X', '2022-06-01', 'doge', 0.85, 'political-memes', {
    approx: 'year', src: ['doge'], desc: 'An online group using Doge-style Shiba avatars to counter Russian propaganda during the invasion of Ukraine.',
    traits: { visual: 'Shiba avatars in uniform', format: 'Avatar community', audience: 'Political X', tone: 'Mocking, activist', character: 'The Fella' },
    ev: [['media', 'Doge-style avatars'], ['community', 'Described as using Doge-style memes']]
  });
  R('doge-logo', 'Twitter’s Doge logo', 'EVENT', 'X', '2023-04-03', 'dogecoin', 0.95, 'crypto-mascots', {
    src: ['doge'], desc: 'Twitter’s bird logo was replaced with the Doge image for several days.',
    traits: { visual: 'Doge as app logo', format: 'Platform branding', audience: 'Every Twitter user' }, ev: [['press', '3–7 Apr 2023']]
  });
  R('kabosu-monument', 'Kabosu monument', 'EVENT', 'IRL', '2023-11-01', 'kabosu', 0.9, 'viral-animals', {
    approx: 'year', src: ['doge'], desc: 'A monument to Kabosu installed in Sakura, Chiba; a manhole cover followed in 2024.',
    traits: { visual: 'Bronze statue', format: 'Public monument', audience: 'Pilgrims', tone: 'Reverent' }, ev: [['press', 'Wikipedia']]
  });
  R('doge-agency', 'D.O.G.E.', 'EVENT', 'NEWS', '2024-11-12', 'dogecoin', 0.85, 'political-memes', {
    src: ['doge'], desc: 'A US government efficiency body announced under the acronym D.O.G.E., a name linked to the meme and Dogecoin.',
    traits: { format: 'Government initiative', audience: 'Political media', tone: 'Political' }, ev: [['caption', 'Acronym references the meme'], ['press', 'Announced 12 Nov 2024']]
  });

  // Pepe the Frog — 2005 comic → memes → symbol fights → token
  R('boys-club', 'Boy’s Club (Pepe)', 'POST', 'WEB', '2005-06-01', null, 0.92, 'reaction-formats', {
    approx: 'year', handle: 'Matt Furie', src: ['pepe'], aliases: ['pepe', 'pepe the frog'],
    desc: 'Matt Furie’s comic Boy’s Club, posted on Myspace, featuring a laid-back frog named Pepe.',
    traits: { visual: 'Hand-drawn green frog', format: 'Web comic', audience: 'Myspace readers', tone: 'Stoner calm', symbols: '“feels good man”', token: 'None', character: 'A chill frog' },
    ev: [['reference', 'Author’s own comic']]
  });
  R('feels-good-man', '“Feels good man”', 'MEME', 'FOURCHAN', '2008-06-01', 'boys-club', 0.9, 'reaction-formats', {
    approx: 'year', src: ['pepe'], desc: 'A comic page with Pepe’s catchphrase uploaded to 4chan’s /b/.',
    traits: { format: 'Reaction image', audience: '4chan', tone: 'Satisfied' }, ev: [['media', 'Comic page reposted']]
  });
  R('sad-frog', 'Sad Frog', 'MEME', 'TUMBLR', '2012-03-01', 'feels-good-man', 0.85, 'reaction-formats', {
    approx: 'year', src: ['pepe'], desc: 'The frog, crying: “feels bad man.”', traits: { visual: 'Crying Pepe', tone: 'Melancholic', character: 'A sad frog' }, ev: [['media', 'Redrawn Pepe']]
  });
  R('smug-pepe', 'Smug Pepe', 'MEME', 'WEB', '2012-06-01', 'feels-good-man', 0.85, 'reaction-formats', {
    approx: 'year', src: ['pepe'], desc: 'A self-satisfied, chin-on-hand Pepe.', traits: { visual: 'Smirking Pepe', tone: 'Smug' }, ev: [['media', 'Redrawn Pepe']]
  });
  R('chinese-pepe', 'Pepe on Baidu Tieba', 'MEME', 'WEB', '2014-06-01', 'sad-frog', 0.8, 'reaction-formats', {
    approx: 'year', src: ['pepe'], desc: 'Chinese-language Pepe variants spread on Baidu Tieba.', traits: { audience: 'Chinese forums' }, ev: [['media', 'Same character']]
  });
  R('rare-pepes', 'Rare Pepes', 'MEME', 'FOURCHAN', '2015-03-01', 'smug-pepe', 0.85, 'reaction-formats', {
    approx: 'year', src: ['pepe'], desc: 'Pepe drawings treated as scarce collectibles.',
    traits: { format: 'Collectible images', audience: '4chan', tone: 'Mock-precious', token: 'Pseudo-scarcity' }, ev: [['caption', '“Rare” watermarks']]
  });
  R('adl-pepe', 'Hate-symbol listing', 'EVENT', 'NEWS', '2016-09-27', 'rare-pepes', 0.9, 'political-memes', {
    src: ['pepe'], desc: 'After alt-right appropriation, the ADL added some Pepe uses to its hate-symbol database.',
    traits: { format: 'Institutional listing', audience: 'Press', tone: 'Alarmed' }, ev: [['press', 'Report dated 27 Sep 2016']]
  });
  R('save-pepe', '#SavePepe', 'EVENT', 'WEB', '2016-10-15', 'adl-pepe', 0.9, 'reaction-formats', {
    approx: 'month', src: ['pepe'], desc: 'Furie’s campaign to reclaim the character.', traits: { format: 'Creator campaign', tone: 'Reclaiming' }, ev: [['reference', 'Launched by the creator']]
  });
  R('pepe-funeral', 'Furie kills Pepe', 'EVENT', 'IRL', '2017-05-06', 'save-pepe', 0.9, 'reaction-formats', {
    src: ['pepe'], desc: 'Furie published a comic showing Pepe’s funeral on Free Comic Book Day.', traits: { format: 'Comic strip', tone: 'Mournful' }, ev: [['reference', 'Creator’s comic']]
  });
  R('hk-pepe', 'Hong Kong protest Pepe', 'MEME', 'IRL', '2019-08-15', 'rare-pepes', 0.8, 'political-memes', {
    approx: 'month', src: ['pepe'], desc: 'Protesters in Hong Kong used Pepe as a symbol of resistance.',
    traits: { visual: 'Pepe on placards and stickers', format: 'Protest iconography', audience: 'Protesters', tone: 'Defiant' }, ev: [['press', 'Reported Aug 2019']]
  });
  R('feels-good-doc', 'Feels Good Man (film)', 'VIDEO', 'TV', '2020-01-25', 'pepe-funeral', 0.9, 'reaction-formats', {
    approx: 'year', src: ['pepe'], desc: 'A documentary about Furie’s fight to reclaim Pepe.', traits: { format: 'Documentary', audience: 'Festival audiences', tone: 'Earnest' }, ev: [['reference', 'About the character']]
  });
  R('kekius', 'Kekius Maximus', 'EVENT', 'X', '2025-01-01', 'rare-pepes', 0.8, 'crypto-mascots', {
    approx: 'month', src: ['pepe'], desc: 'Elon Musk briefly renamed his X account “Kekius Maximus” with a Pepe image, boosting a memecoin of that name.',
    traits: { visual: 'Pepe in Roman armour', format: 'Profile change', audience: 'X', tone: 'Trolling', token: 'Boosted a same-name memecoin' }, ev: [['press', 'January 2025']]
  });

  /* ---------------- generator ---------------- */
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const rnd = mulberry32(2142019);
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];

  const PLACES = ['Lagos', 'Osaka', 'São Paulo', 'Manila', 'Warsaw', 'Seoul', 'Lima', 'Cairo', 'Glasgow', 'Jakarta', 'Montréal', 'Nairobi'];
  // [pattern, type, platforms, trait changes]
  const TEMPLATES = [
    ['{s} (slowed)', 'VIDEO', ['TIKTOK', 'YOUTUBE'], { format: 'Slowed + reverb edit', tone: 'Melancholic, hazy' }],
    ['{s}, sped up', 'VIDEO', ['TIKTOK'], { format: 'Sped-up audio edit', tone: 'Frantic' }],
    ['{s} duet', 'VIDEO', ['TIKTOK'], { format: 'Split-screen duet', audience: 'Creators answering creators' }],
    ['{s} remix', 'VIDEO', ['YOUTUBE', 'TIKTOK'], { format: 'Music remix', tone: 'Danceable' }],
    ['{s} template', 'FORMAT', ['X', 'REDDIT'], { format: 'Fill-in caption template' }],
    ['{s} reaction', 'MEME', ['X', 'REDDIT'], { format: 'Reaction image', tone: 'Ironic' }],
    ['8-bit {s}', 'MEME', ['REDDIT', 'TUMBLR'], { visual: 'Pixel-art redraw' }],
    ['{s}: {p} cut', 'VIDEO', ['TIKTOK', 'INSTAGRAM'], { audience: 'Local scene in {p}', visual: 'Re-shot in {p}' }],
    ['{s} stickers', 'MEME', ['DISCORD', 'X'], { format: 'Sticker set', visual: 'Die-cut outline' }],
    ['{s}, explained', 'NARRATIVE', ['YOUTUBE'], { format: 'Explainer video essay', tone: 'Earnest, analytical', audience: 'Latecomers' }],
    ['{s} lore thread', 'NARRATIVE', ['X', 'TUMBLR'], { format: 'Long thread', tone: 'Mythologising' }],
    ['{s} server', 'COMMUNITY', ['DISCORD'], { format: 'Chat community', audience: 'Core fans' }],
    ['r/{slug}', 'COMMUNITY', ['REDDIT'], { format: 'Subreddit', audience: 'Collectors and archivists' }],
    ['{s} karaoke', 'VIDEO', ['TIKTOK', 'TWITCH'], { format: 'Sing-along video', tone: 'Communal' }],
    ['{s} fan cam', 'VIDEO', ['TIKTOK', 'X'], { format: 'Fan edit', tone: 'Adoring' }],
    ['{s} zine', 'NARRATIVE', ['TUMBLR', 'INSTAGRAM'], { format: 'Printed zine scans', audience: 'Small-press readers' }],
    ['{s} filter', 'FORMAT', ['INSTAGRAM', 'TIKTOK'], { visual: 'AR face filter', format: 'Camera effect' }],
    ['{s} bot', 'CHARACTER', ['X', 'DISCORD'], { character: 'Automated persona that replies in-voice', format: 'Reply bot' }],
    ['{s} at 3 a.m.', 'MEME', ['X', 'TUMBLR'], { tone: 'Unhinged', symbols: 'Clock reading 3:00' }],
    ['{s} in the wild', 'POST', ['REDDIT', 'INSTAGRAM'], { format: 'Real-world sighting photo', visual: 'Spotted on a street sign' }],
    ['{s} speedrun', 'VIDEO', ['TWITCH', 'YOUTUBE'], { format: 'Speedrun', audience: 'Speedrunners' }],
    ['Tiny {s}', 'MEME', ['INSTAGRAM', 'X'], { visual: 'Miniature version', tone: 'Cute' }],
    ['{s} but it’s a sitcom', 'VIDEO', ['YOUTUBE', 'TIKTOK'], { format: 'Laugh-track edit', tone: 'Mock-wholesome' }],
    ['{s} timeline', 'NARRATIVE', ['X'], { format: 'Annotated timeline', audience: 'Archivists' }],
    ['{s} plush', 'FORMAT', ['INSTAGRAM'], { format: 'Handmade plush pattern', visual: 'Felt and stitches' }],
    ['{T}', 'TOKEN', ['ONCHAIN'], { format: 'Fungible token', audience: 'Meme traders', tone: 'Promotional', token: 'Ticker {T}' }]
  ];
  const GEN_EV = {
    high: [['media', 'Reuses the parent’s media asset'], ['caption', 'Caption names the parent'], ['crosslink', 'Links back to the parent post']],
    mid: [['caption', 'Caption or hashtag overlap with the parent'], ['community', 'Commenters identify the parent']],
    low: [['community', 'Some commenters link it to the parent'], ['counter', 'Creator says it was made independently']]
  };
  const slugify = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const usedIds = new Set(RAW.map(r => r.id));
  const usedNames = new Set(RAW.map(r => r.name.toLowerCase()));
  let genCount = 0;

  function iso(t) { return new Date(t).toISOString().slice(0, 10); }

  function generate(seedNode) {
    const g = seedNode.grow; if (!g) return;
    const from = Math.max(+new Date(g.from), +new Date(seedNode.date) + 2 * DAY);
    const to = Math.min(+new Date(g.to), +SAMPLE_NOW - DAY);
    const pool = [seedNode];
    // dates sorted ascending so parents precede children
    const N = Math.round(g.n * 1.7);
    const dates = Array.from({ length: N }, () => from + rnd() * (to - from)).sort((a, b) => a - b);
    for (let i = 0; i < N; i++) {
      let parent = seedNode;
      if (pool.length > 1 && rnd() < g.chain) {
        // favour recent, deeper nodes
        const cands = pool.slice(-Math.max(2, Math.ceil(pool.length * 0.5)));
        parent = pick(cands);
      } else if (pool.length > 2 && rnd() < 0.35) parent = pick(pool);
      let d = Math.max(dates[i], +new Date(parent.date) + (2 + rnd() * 20) * DAY);
      if (d > to) d = Math.max(+new Date(parent.date) + DAY, to - rnd() * 3 * DAY);
      const stem = parent.stem || parent.name;
      const tick = '$' + stem.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 5);
      let tpl, place, name;
      for (let tries = 0; tries < 8; tries++) {
        tpl = pick(TEMPLATES);
        if (tpl[1] === 'TOKEN' && rnd() < 0.6) tpl = pick(TEMPLATES.slice(0, -1));
        place = pick(PLACES);
        name = tpl[0].replace('{s}', stem).replace('{p}', place).replace('{slug}', slugify(stem).replace(/-/g, '')).replace('{T}', tick);
        if (!usedNames.has(name.toLowerCase())) break;
      }
      let k = 2; const base = name;
      while (usedNames.has(name.toLowerCase())) { name = base + ' ' + ['II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'][Math.min(k - 2, 6)]; k++; }
      usedNames.add(name.toLowerCase());
      let id = slugify(name) || 'obj'; while (usedIds.has(id)) id = id + '-' + (++genCount).toString(36);
      usedIds.add(id);
      const r1 = rnd(), r2 = rnd();
      const conf = +(0.36 + (1 - r1 * r2) * 0.62).toFixed(2);
      const tier = conf >= 0.85 ? 'high' : conf >= 0.55 ? 'mid' : 'low';
      const ev = tier === 'high' ? GEN_EV.high.slice(0, 2 + (rnd() < 0.5 ? 1 : 0)) : GEN_EV[tier].slice();
      const tChanges = {};
      for (const [key, val] of Object.entries(tpl[3])) tChanges[key] = val.replace(/\{p\}/g, place).replace('{T}', tick);
      const node = {
        id, name, type: tpl[1], platform: pick(tpl[2]), date: iso(d), parent: parent.id, conf,
        family: tpl[1] === 'TOKEN' ? 'crypto-mascots' : seedNode.family,
        stem, ticker: tpl[1] === 'TOKEN' ? tick : undefined, generated: true,
        desc: null, traits: tChanges, ev
      };
      RAW.push(node); pool.push(node);
    }
  }
  RAW.slice().forEach(generate);

  /* ---------------- index + derived metrics ---------------- */
  const byId = new Map();
  RAW.forEach(r => byId.set(r.id, Object.assign(r, { children: [], t: +new Date(r.date + 'T00:00:00Z') })));
  RAW.forEach(r => { if (r.parent) byId.get(r.parent).children.push(r.id); });
  RAW.forEach(r => r.children.sort((a, b) => byId.get(a).t - byId.get(b).t));
  const roots = RAW.filter(r => !r.parent);

  function walk(n, depth, root) {
    n.depth = depth; n.root = root.id;
    // inherited traits
    const pt = n.parent ? byId.get(n.parent).fullTraits : {};
    const own = n.traits || {};
    n.fullTraits = Object.assign({}, pt, own, { platform: PLATFORMS[n.platform] });
    if (!n.fullTraits.token) n.fullTraits.token = 'None';
    if (n.type === 'TOKEN' && n.ticker && !own.token) n.fullTraits.token = 'Ticker ' + n.ticker;
    let desc = 0, below = 0, last = n.t; const plats = new Set([n.platform]);
    n.children.forEach(cid => {
      const c = byId.get(cid); walk(c, depth + 1, root);
      desc += 1 + c.descendants; below = Math.max(below, 1 + c.depthBelow); last = Math.max(last, c.lastT);
      c.platformSet.forEach(p => plats.add(p));
    });
    n.descendants = desc; n.depthBelow = below; n.lastT = last; n.platformSet = plats;
  }
  roots.forEach(r => walk(r, 0, r));

  const now = +SAMPLE_NOW;
  function subtree(id, out = []) { const n = byId.get(id); n.children.forEach(c => { out.push(byId.get(c)); subtree(c, out); }); return out; }

  RAW.forEach(n => {
    const p = n.parent ? byId.get(n.parent) : null;
    n.forks = n.children.length;
    n.platforms = n.platformSet.size;
    n.yearsActive = (n.lastT - n.t) / (365.25 * DAY);
    const raw = 2 * n.forks + 0.5 * n.descendants + 5 * n.depthBelow + 4 * (n.platforms - 1) + 2 * n.yearsActive;
    n.score = n.descendants === 0 ? 0 : Math.round(100 * (1 - Math.exp(-raw / 40)));
    // trait changes vs parent
    n.changed = p ? TRAITS.map(t => t[0]).filter(k => n.fullTraits[k] !== p.fullTraits[k]) : [];
    n.mutation = !!p && (n.type !== p.type || n.changed.filter(k => k !== 'platform').length >= 2);
    // evidence: computed timestamp precedence first
    const ev = [];
    if (p) {
      const gap = Math.round((n.t - p.t) / DAY);
      const lab = x => x.approx ? '~' + x.date.slice(0, x.approx === 'year' ? 4 : 7) : x.date;
      ev.push({ kind: 'timestamp', text: `${n.reported ? 'First reported' : 'First seen'} ${lab(n)}; parent ${lab(p)} (${gap.toLocaleString('en')} days earlier${n.approx || p.approx ? ', approximate' : ''})` });
    }
    (n.ev || []).forEach(([kind, text]) => ev.push({ kind, text }));
    n.evidence = ev;
    n.relation = n.conf >= 0.85 ? 'VERIFIED' : n.conf >= 0.55 ? 'LIKELY' : 'DISPUTED';
    n.url = n.doc && n.sources.length ? n.sources[0][1] : 'sample://' + n.platform.toLowerCase() + '/' + n.id;
    if (!n.doc) n.sources = [];
  });

  // momentum + status
  const W = 14 * DAY;
  RAW.forEach(n => {
    const kids = n.children.map(c => byId.get(c));
    const sub = subtree(n.id);
    n.forks14 = kids.filter(k => now - k.t <= W).length;
    n.forksPrev14 = kids.filter(k => now - k.t > W && now - k.t <= 2 * W).length;
    n.forksPrev30 = kids.filter(k => now - k.t > 30 * DAY && now - k.t <= 60 * DAY).length;
    n.forks30 = kids.filter(k => now - k.t <= 30 * DAY).length;
    n.desc30 = sub.filter(k => now - k.t <= 30 * DAY).length;
    n.desc180 = sub.filter(k => now - k.t <= 180 * DAY).length;
    n.weekly = Array.from({ length: 12 }, (_, i) => {
      const end = now - (11 - i) * 7 * DAY, start = end - 7 * DAY;
      return kids.filter(k => k.t > start && k.t <= end).length;
    });
    const age = (now - n.t) / DAY;
    let s;
    if (n.forks30 >= 3) s = 'FORKING';
    else if (!n.parent && age < 180) s = 'ORIGIN';
    else if (n.desc30 >= 5) s = 'PEAKING';
    else if (age < 90) s = 'EMERGING';
    else if (n.desc180 >= 2) s = 'SPREADING';
    else if (age > 3 * 365 && n.score >= 55) s = 'LEGACY';
    else s = 'COOLING';
    n.status = s;
  });

  // path confidence
  RAW.forEach(n => {
    let c = 1, cur = n;
    while (cur.parent) { c *= cur.conf; cur = byId.get(cur.parent); }
    n.pathConf = n.parent ? c : n.conf;
  });

  window.FORK_DATA = {
    SAMPLE_NOW, DAY, PLATFORMS, TYPES, STATUSES, TRAITS, EVIDENCE_KINDS, FAMILIES,
    nodes: RAW, byId, roots, subtree,
    ancestors(id) { const out = []; let n = byId.get(id); while (n && n.parent) { n = byId.get(n.parent); out.unshift(n); } return out; },
    family(id) { return FAMILIES.find(f => f.id === id); }
  };
})();
