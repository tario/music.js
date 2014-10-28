var percussion = new MUSIC.PatchInstrument({
    'C': music.sound("src/sound/Kick 1.wav"),
    'D': music.sound("src/sound/Effect 1.wav"),
    'E': music.sound("src/sound/Snare 1.wav")
            .stopDelay(1000)
}, 0);

instruments.add("Percussion patch", percussion);
