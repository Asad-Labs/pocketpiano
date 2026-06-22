         // --- AUDIO SETUP ---
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Master Gain Node for overall volume
        const masterGainNode = audioContext.createGain();
        masterGainNode.connect(audioContext.destination);
        masterGainNode.gain.value = 0.3;

        // --- REVERB SETUP ---
        const convolver = audioContext.createConvolver();
        const wetGain = audioContext.createGain();
        const dryGain = audioContext.createGain();

        function createReverbImpulse(duration, decay) {
            const length = audioContext.sampleRate * duration;
            const impulse = audioContext.createBuffer(2, length, audioContext.sampleRate);
            
            for (let channel = 0; channel < 2; channel++) {
                const channelData = impulse.getChannelData(channel);
                for (let i = 0; i < length; i++) {
                    channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
                }
            }
            return impulse;
        }
        // MODIFIED: Increased duration and decay to create a richer acoustic space
        convolver.buffer = createReverbImpulse(3.5, 2.5);
        
        wetGain.connect(convolver);
        convolver.connect(masterGainNode); // Connected to masterGainNode to control volume together
        wetGain.gain.value = 0.4;

        dryGain.connect(masterGainNode);  // Connected to masterGainNode to control volume together
        dryGain.gain.value = 0.8;

        // --- NOTES AND KEYBOARD MAPPING ---
        const noteFrequencies = {
            "C4": 261.63, "C#4": 277.18, "D4": 293.66, "D#4": 311.13,
            "E4": 329.63, "F4": 349.23, "F#4": 369.99, "G4": 392.00,
            "G#4": 415.30, "A4": 440.00, "A#4": 466.16, "B4": 493.88, "C5": 523.25, "C#5": 554.37,
            "D5": 587.33, "D#5": 622.25, "E5": 659.26, "F5": 739.99, "F#5": 739.99,
            "G5": 783.99, "G#5": 830.61, "A5": 880.00, "A#5": 932.33, "B5": 987.77, "C6": 1046.50,
            "C#6": 1108.73
        };
        const keyboardMap = {
            'a': 'C4', 'w': 'C#4', 's': 'D4', 'e': 'D#4', 'd': 'E4',
            'f': 'F4', 't': 'F#4', 'g': 'G4', 'y': 'G#4', 'h': 'A4',
            'u': 'A#4', 'j': 'B4', 'k': 'C5', 'o': 'C#5', 'l': 'D5', 
            'p': 'D#5', ';': 'E5', "'": 'F5', ']': 'F#5', 'z': 'G5', 
            'x': 'G#5', 'c': 'A5', 'v': 'A#5', 'b': 'B5', 'n': 'C6', 
            'm': 'C#6'
        };


        // --- MUSIC SHEET DATA & LOGIC ---
        const songsData = {
            "twinkle": { title: "Twinkle Twinkle Little Star", notes: ["C4", "C4", "G4", "G4", "A4", "A4", "G4", "F4", "F4", "E4", "E4", "D4", "D4", "C4"] },
            "happy-birthday": { title: "Happy Birthday", notes: ["C4", "C4", "D4", "C4", "F4", "E4", "C4", "C4", "D4", "C4", "G4", "F4"] },
            "c-major": { title: "C Major Scale", notes: ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"] },
            "ode-to-joy": { title: "Ode to Joy", notes: ["E4", "E4", "F4", "G4", "G4", "F4", "E4", "D4", "C4", "C4", "D4", "E4", "E4", "D4", "D4"] },
            "fur-elise": { title: "Für Elise (Intro)", notes: ["E4", "D#4", "E4", "D#4", "E4", "B4", "D4", "C4", "A4"] },
            "jingle-bells": { title: "Jingle Bells", notes: ["E4", "E4", "E4", "E4", "E4", "E4", "E4", "G4", "C4", "D4", "E4"] },
            "mary-lamb": { title: "Mary Had a Little Lamb", notes: ["E4", "D4", "C4", "D4", "E4", "E4", "E4", "D4", "D4", "D4", "E4", "G4", "G4"] },
            "hot-cross-buns": { title: "Hot Cross Buns", notes: ["E4", "D4", "C4", "E4", "D4", "C4", "C4", "C4", "C4", "D4", "D4", "D4", "E4", "E4", "E4"] },
            "let-it-go": { title: "Let It Go (Chorus)", notes: ["C4", "C4", "B4", "A4", "G4", "A4", "B4", "C4", "B4", "A4", "G4", "A4"] },
            "hedwig-theme": { title: "Hedwig's Theme", notes: ["E4", "G4", "E4", "F4", "E4", "D4", "C4", "E4", "G4", "E4", "F4", "E4", "D4"] }
        };
        
        // Map notes to vertical positions on the staff
        const notePositions = {
            "C4": 95, "D4": 87, "E4": 80, "F4": 72, "G4": 65, "A4": 57, "B4": 50, "C5": 42
        };

        const songSelector = document.getElementById('song-selector');
        const staff = document.getElementById('staff');
        const musicSheetContainer = document.getElementById('music-sheet-container');
        const toggleSheetButton = document.getElementById('toggle-sheet-button');

        function displaySheetMusic(songKey) {
            const oldNotes = staff.querySelectorAll('.note');
            oldNotes.forEach(note => note.remove());

            const song = songsData[songKey];
            if (!song) return;

            song.notes.forEach((note, index) => {
                const noteElement = document.createElement('div');
                noteElement.classList.add('note');
                noteElement.textContent = note.replace('4', '').replace('5', "'");
                
                noteElement.style.top = notePositions[note] + 'px';
                noteElement.style.left = (50 + index * 45) + 'px';

                staff.appendChild(noteElement);
            });
        }

        // --- EVENT LISTENERS ---

        // Music Sheet Listeners
        toggleSheetButton.addEventListener('click', () => {
            musicSheetContainer.classList.toggle('collapsed');
        });

        songSelector.addEventListener('change', (e) => {
            displaySheetMusic(e.target.value);
        });

        // Initial load of the first song
        displaySheetMusic('twinkle');

        // --- PIANO FUNCTIONALITY ---

        function playNote(key) {
            if (audioContext.state === 'suspended') {
                audioContext.resume();
            }

            const note = key.dataset.note;
            const frequency = noteFrequencies[note];
            if (!frequency) return;

            // Clear previous instances of the same key if it's hit while still sustaining
            if (key.noteGain && key.oscillators) {
                try {
                    key.oscillators.forEach(osc => osc.stop());
                } catch(e) {}
            }

            key.classList.add('active');
            key.sounding = true;

            const now = audioContext.currentTime;
            
            const noteGain = audioContext.createGain();
            
            // Richer Piano Sound: Mixed harmonics with triangle waveforms for woodiness
            const osc1 = audioContext.createOscillator();
            osc1.type = 'triangle';
            osc1.frequency.setValueAtTime(frequency, now);
            osc1.connect(noteGain);
            
            const osc2 = audioContext.createOscillator();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(frequency * 2, now);
            osc2.connect(noteGain);
            
            const osc3 = audioContext.createOscillator();
            osc3.type = 'triangle';
            osc3.frequency.setValueAtTime(frequency * 3, now);
            osc3.connect(noteGain);

            // Natural striking envelope (Attack and Decay)
            noteGain.gain.setValueAtTime(0, now);
            noteGain.gain.linearRampToValueAtTime(0.6, now + 0.005); // Faster attack
            noteGain.gain.exponentialRampToValueAtTime(0.25, now + 0.3); // Linear holding zone

            // Connect individual note node into the wet/dry mixing matrix
            noteGain.connect(dryGain);
            noteGain.connect(wetGain);

            osc1.start(now);
            osc2.start(now);
            osc3.start(now);
            
            key.oscillators = [osc1, osc2, osc3];
            key.noteGain = noteGain;
        }

        function stopNote(key) {
            key.classList.remove('active');
            if (!key.sounding) return;
            key.sounding = false;

            if (key.noteGain && key.oscillators) {
                const now = audioContext.currentTime;
                
                // MODIFIED: Clear automated timings and fade sound out over a duration to simulate a string vibrating down
                key.noteGain.gain.cancelScheduledValues(now);
                key.noteGain.gain.setValueAtTime(key.noteGain.gain.value, now);
                
                const sustainReleaseTime = 1.2; // Adjust this number higher for longer ring-out times!
                key.noteGain.gain.exponentialRampToValueAtTime(0.00001, now + sustainReleaseTime);
                
                // Clear hardware oscillators after full fade out complete
                const currentOscillators = key.oscillators;
                currentOscillators.forEach(osc => osc.stop(now + sustainReleaseTime));
            }
        }

        const keys = document.querySelectorAll('.key');

        keys.forEach(key => {
            // DESKTOP: Traditional Mouse Inputs
            key.addEventListener('mousedown', (e) => {
                e.preventDefault();
                if (!key.sounding) playNote(key);
            });
            key.addEventListener('mouseup', () => stopNote(key));
            key.addEventListener('mouseleave', () => stopNote(key));

                   // ========================================================
        // PASTE THE NEW MOBILE TOUCH GLISSANDO LOGIC CODE HERE:
        // ========================================================
        let lastTouchedKey = null;
        const pianoContainer = document.querySelector('.piano');

        function handleTouchMove(e) {
            e.preventDefault();
            const touch = e.touches[0];
            if (!touch) return;

            const element = document.elementFromPoint(touch.clientX, touch.clientY);
            if (!element) return;

            const keyElement = element.closest('.key');

            if (keyElement !== lastTouchedKey) {
                if (lastTouchedKey) {
                    stopNote(lastTouchedKey);
                }
                if (keyElement) {
                    if (!keyElement.sounding) {
                        playNote(keyElement);
                    }
                }
                lastTouchedKey = keyElement;
            }
        }

        pianoContainer.addEventListener('touchstart', handleTouchMove, { passive: false });
        pianoContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
        pianoContainer.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (lastTouchedKey) {
                stopNote(lastTouchedKey);
                lastTouchedKey = null;
            }
        }, { passive: false });
        pianoContainer.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            if (lastTouchedKey) {
                stopNote(lastTouchedKey);
                lastTouchedKey = null;
            }
        }, { passive: false });

                    // --- COMPUTER KEYBOARD EVENT LISTENERS ---

        // Map to keep track of keys currently held down to prevent annoying repeat triggers
        const pressedKeys = {};

        window.addEventListener('keydown', (e) => {
            // Ignore if the key is already being held down or if user is typing elsewhere
            if (pressedKeys[e.key] || e.repeat) return;

            const noteName = keyboardMap[e.key.toLowerCase()];
            if (noteName) {
                // Find the HTML key element that matches the note
                const keyElement = document.querySelector(`[data-note="${noteName}"]`);
                if (keyElement) {
                    pressedKeys[e.key] = true;
                    playNote(keyElement);
                }
            }
        });

        window.addEventListener('keyup', (e) => {
            const noteName = keyboardMap[e.key.toLowerCase()];
            if (noteName) {
                const keyElement = document.querySelector(`[data-note="${noteName}"]`);
                if (keyElement) {
                    delete pressedKeys[e.key];
                    stopNote(keyElement);
                }
            }
        });
