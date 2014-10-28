var piano = music
              .soundfont(MIDI.Soundfont.acoustic_grand_piano)
              .mapNote(function(n){return n+36;});
instruments.add("Piano", piano);
