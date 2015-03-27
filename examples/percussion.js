/*instruments.add("KICK", music.sound("src/sound/Kick 1.wav"));
instruments.add("Effect", music.sound("src/sound/Effect 1.wav"));
instruments.add("Snare", music.sound("src/sound/Snare 1.wav"));*/

return new MUSIC.PatchInstrument({
  "C": music.sound("src/sound/Kick 1.wav"),
  "D": music.sound("src/sound/Effect 1.wav"),
  "E":  music.sound("src/sound/Snare 1.wav")  
}).mapNote(function(n){return n-36;});
