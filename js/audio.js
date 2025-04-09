// Audio Manager for Three.js Forest Scene
class AudioManager {
    constructor(camera, listener) {
        // Create audio listener if not provided
        this.listener = listener || new THREE.AudioListener();
        
        // Attach listener to camera if provided
        if (camera) {
            camera.add(this.listener);
        }
        
        // Sound collections
        this.ambientSounds = {};
        this.pointSounds = {};
        this.voiceOvers = {};
        
        // Master volume controls
        this.masterVolume = 1.0;
        this.ambientVolume = 0.5;
        this.effectsVolume = 0.8;
        this.voiceVolume = 1.0;
        
        // Track currently playing voice
        this.currentVoiceOver = null;
    }
    
    // Add ambient sound (non-positional background sounds)
    addAmbientSound(name, path, options = {}) {
        const sound = new THREE.Audio(this.listener);
        
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load(path, (buffer) => {
            sound.setBuffer(buffer);
            sound.setLoop(options.loop !== undefined ? options.loop : true);
            sound.setVolume(options.volume !== undefined ? options.volume * this.ambientVolume : this.ambientVolume);
            
            if (options.autoplay) {
                sound.play();
            }
            
            console.log(`Ambient sound "${name}" loaded`);
        });
        
        this.ambientSounds[name] = {
            sound: sound,
            options: options
        };
        
        return sound;
    }
    
    // Add positional sound (sounds that come from specific points in 3D space)
    addPointSound(name, path, object, options = {}) {
        const sound = new THREE.PositionalAudio(this.listener);
        
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load(path, (buffer) => {
            sound.setBuffer(buffer);
            sound.setLoop(options.loop !== undefined ? options.loop : false);
            sound.setVolume(options.volume !== undefined ? options.volume * this.effectsVolume : this.effectsVolume);
            sound.setRefDistance(options.refDistance || 5);
            sound.setMaxDistance(options.maxDistance || 100);
            sound.setDistanceModel(options.distanceModel || 'exponential');
            
            if (options.autoplay) {
                sound.play();
            }
            
            console.log(`Point sound "${name}" loaded`);
        });
        
        // Attach to the object
        if (object) {
            object.add(sound);
        }
        
        this.pointSounds[name] = {
            sound: sound,
            object: object,
            options: options
        };
        
        return sound;
    }
    
    // Add voice over (speech that can be triggered)
    addVoiceOver(name, path, options = {}) {
        const sound = new THREE.Audio(this.listener);
        
        const audioLoader = new THREE.AudioLoader();
        audioLoader.load(path, (buffer) => {
            sound.setBuffer(buffer);
            sound.setLoop(false); // Voice overs generally shouldn't loop
            sound.setVolume(options.volume !== undefined ? options.volume * this.voiceVolume : this.voiceVolume);
            
            // Add onEnded callback
            sound.onEnded = () => {
                this.currentVoiceOver = null;
                if (options.onEnded) {
                    options.onEnded();
                }
                console.log(`Voice over "${name}" finished`);
            };
            
            console.log(`Voice over "${name}" loaded`);
        });
        
        this.voiceOvers[name] = {
            sound: sound,
            options: options
        };
        
        return sound;
    }
    
    // Play ambient sound
    playAmbient(name) {
        const soundObj = this.ambientSounds[name];
        if (soundObj && soundObj.sound && soundObj.sound.buffer) {
            soundObj.sound.play();
            return true;
        }
        return false;
    }
    
    // Play point sound
    playPointSound(name) {
        const soundObj = this.pointSounds[name];
        if (soundObj && soundObj.sound && soundObj.sound.buffer) {
            soundObj.sound.play();
            return true;
        }
        return false;
    }
    
    // Play voice over (stops any currently playing voice over)
    playVoiceOver(name, force = false) {
        // If a voice over is already playing and force is false, don't interrupt
        if (this.currentVoiceOver && !force) {
            return false;
        }
        
        // Stop current voice over if any
        if (this.currentVoiceOver) {
            this.stopVoiceOver(this.currentVoiceOver);
        }
        
        const voiceObj = this.voiceOvers[name];
        if (voiceObj && voiceObj.sound && voiceObj.sound.buffer) {
            voiceObj.sound.play();
            this.currentVoiceOver = name;
            return true;
        }
        
        return false;
    }
    
    // Stop specific ambient sound
    stopAmbient(name) {
        const soundObj = this.ambientSounds[name];
        if (soundObj && soundObj.sound) {
            soundObj.sound.stop();
            return true;
        }
        return false;
    }
    
    // Stop specific point sound
    stopPointSound(name) {
        const soundObj = this.pointSounds[name];
        if (soundObj && soundObj.sound) {
            soundObj.sound.stop();
            return true;
        }
        return false;
    }
    
    // Stop specific voice over
    stopVoiceOver(name) {
        const voiceObj = this.voiceOvers[name];
        if (voiceObj && voiceObj.sound) {
            voiceObj.sound.stop();
            if (this.currentVoiceOver === name) {
                this.currentVoiceOver = null;
            }
            return true;
        }
        return false;
    }
    
    // Stop all ambient sounds
    stopAllAmbient() {
        for (const name in this.ambientSounds) {
            this.stopAmbient(name);
        }
    }
    
    // Stop all point sounds
    stopAllPointSounds() {
        for (const name in this.pointSounds) {
            this.stopPointSound(name);
        }
    }
    
    // Stop all voice overs
    stopAllVoiceOvers() {
        for (const name in this.voiceOvers) {
            this.stopVoiceOver(name);
        }
        this.currentVoiceOver = null;
    }
    
    // Stop all sounds
    stopAll() {
        this.stopAllAmbient();
        this.stopAllPointSounds();
        this.stopAllVoiceOvers();
    }
    
    // Set master volume (affects all sounds)
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        
        // Update all sound volumes
        this.updateAllVolumes();
    }
    
    // Set ambient volume
    setAmbientVolume(volume) {
        this.ambientVolume = Math.max(0, Math.min(1, volume));
        this.updateAmbientVolumes();
    }
    
    // Set effects volume
    setEffectsVolume(volume) {
        this.effectsVolume = Math.max(0, Math.min(1, volume));
        this.updatePointSoundVolumes();
    }
    
    // Set voice volume
    setVoiceVolume(volume) {
        this.voiceVolume = Math.max(0, Math.min(1, volume));
        this.updateVoiceOverVolumes();
    }
    
    // Update all volumes
    updateAllVolumes() {
        this.updateAmbientVolumes();
        this.updatePointSoundVolumes();
        this.updateVoiceOverVolumes();
    }
    
    // Update ambient volumes
    updateAmbientVolumes() {
        for (const name in this.ambientSounds) {
            const soundObj = this.ambientSounds[name];
            if (soundObj && soundObj.sound) {
                const baseVolume = soundObj.options.volume !== undefined ? soundObj.options.volume : 1.0;
                soundObj.sound.setVolume(baseVolume * this.ambientVolume * this.masterVolume);
            }
        }
    }
    
    // Update point sound volumes
    updatePointSoundVolumes() {
        for (const name in this.pointSounds) {
            const soundObj = this.pointSounds[name];
            if (soundObj && soundObj.sound) {
                const baseVolume = soundObj.options.volume !== undefined ? soundObj.options.volume : 1.0;
                soundObj.sound.setVolume(baseVolume * this.effectsVolume * this.masterVolume);
            }
        }
    }
    
    // Update voice over volumes
    updateVoiceOverVolumes() {
        for (const name in this.voiceOvers) {
            const voiceObj = this.voiceOvers[name];
            if (voiceObj && voiceObj.sound) {
                const baseVolume = voiceObj.options.volume !== undefined ? voiceObj.options.volume : 1.0;
                voiceObj.sound.setVolume(baseVolume * this.voiceVolume * this.masterVolume);
            }
        }
    }
    
    // Create a sound analyzer for visualizations
    createAnalyzer(sound, fftSize = 32) {
        const analyzer = new THREE.AudioAnalyser(sound, fftSize);
        return analyzer;
    }

    
}

// Text-to-Speech manager using Web Speech API
class SpeechManager {
    constructor() {
        // Check if browser supports speech synthesis
        this.isSupported = 'speechSynthesis' in window;
        
        if (!this.isSupported) {
            console.warn('Speech synthesis is not supported in this browser');
            return;
        }
        
        // Get speech synthesis and available voices
        this.synth = window.speechSynthesis;
        this.voices = [];
        
        // Load available voices
        this.loadVoices();
        
        // If voices aren't loaded yet, set up an event listener
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = this.loadVoices.bind(this);
        }
        
        // Track if currently speaking
        this.isSpeaking = false;
        
        // Default voice settings
        this.defaultSettings = {
            voice: null,  // Will be set when voices are loaded
            rate: 1.0,    // Speech rate (0.1 to 10)
            pitch: 1.0,   // Pitch (0 to 2)
            volume: 1.0   // Volume (0 to 1)
        };
    }
    
    // Load available voices
    loadVoices() {
        this.voices = this.synth.getVoices();
        
        if (this.voices.length > 0) {
            // Try to find an English voice
            const englishVoice = this.voices.find(voice => 
                voice.lang.includes('en') && voice.localService
            );
            
            // Set default voice
            this.defaultSettings.voice = englishVoice || this.voices[0];
            
            console.log(`Loaded ${this.voices.length} voices. Default: ${this.defaultSettings.voice.name}`);
        }
    }
    
    // Speak text
    speak(text, options = {}) {
        if (!this.isSupported) return false;
        
        // Cancel any current speech
        this.stop();
        
        // Create utterance
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Apply settings
        utterance.voice = options.voice || this.defaultSettings.voice;
        utterance.rate = options.rate || this.defaultSettings.rate;
        utterance.pitch = options.pitch || this.defaultSettings.pitch;
        utterance.volume = options.volume || this.defaultSettings.volume;
        
        // Set event handlers
        utterance.onstart = () => {
            this.isSpeaking = true;
            if (options.onStart) options.onStart();
        };
        
        utterance.onend = () => {
            this.isSpeaking = false;
            if (options.onEnd) options.onEnd();
        };
        
        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            this.isSpeaking = false;
            if (options.onError) options.onError(event);
        };
        
        // Start speaking
        this.synth.speak(utterance);
        return true;
    }
    
    // Stop speaking
    stop() {
        if (!this.isSupported) return;
        
        this.synth.cancel();
        this.isSpeaking = false;
    }
    
    // Pause speaking
    pause() {
        if (!this.isSupported) return;
        
        this.synth.pause();
    }
    
    // Resume speaking
    resume() {
        if (!this.isSupported) return;
        
        this.synth.resume();
    }
    
    // Get available voices
    getVoices() {
        return this.voices;
    }
    
    // Set voice by name or index
    setVoice(voiceNameOrIndex) {
        if (!this.isSupported || this.voices.length === 0) return false;
        
        let voice;
        
        if (typeof voiceNameOrIndex === 'number') {
            // Set by index
            if (voiceNameOrIndex >= 0 && voiceNameOrIndex < this.voices.length) {
                voice = this.voices[voiceNameOrIndex];
            }
        } else {
            // Set by name
            voice = this.voices.find(v => 
                v.name.toLowerCase().includes(voiceNameOrIndex.toLowerCase())
            );
        }
        
        if (voice) {
            this.defaultSettings.voice = voice;
            return true;
        }
        
        return false;
    }
    
    // Set speech rate
    setRate(rate) {
        if (!this.isSupported) return;
        
        // Clamp rate between 0.1 and 10
        this.defaultSettings.rate = Math.max(0.1, Math.min(10, rate));
    }
    
    // Set pitch
    setPitch(pitch) {
        if (!this.isSupported) return;
        
        // Clamp pitch between 0 and 2
        this.defaultSettings.pitch = Math.max(0, Math.min(2, pitch));
    }
    
    // Set volume
    setVolume(volume) {
        if (!this.isSupported) return;
        
        // Clamp volume between 0 and 1
        this.defaultSettings.volume = Math.max(0, Math.min(1, volume));
    }
    
    // Check if browser is currently speaking
    isCurrentlySpeaking() {
        return this.isSpeaking;
    }
    
    // Get a list of available voice names
    getVoiceNames() {
        return this.voices.map(voice => ({
            name: voice.name,
            lang: voice.lang,
            default: voice.default,
            local: voice.localService
        }));
    }
    
    // Advanced speak with SSML support (if browser supports it)
    speakSSML(ssml, options = {}) {
        if (!this.isSupported) return false;
        
        // Strip SSML tags for browsers that don't support it
        const plainText = ssml.replace(/<[^>]*>/g, '');
        return this.speak(plainText, options);
    }
}

// Initialize speech manager with narrations
function setupSpeechSynthesis() {
    // Create speech manager
    const speechManager = new SpeechManager();
    
    if (!speechManager.isSupported) {
        console.warn('Speech synthesis not supported. Please use a compatible browser like Chrome or Edge.');
        return null;
    }
    
    // Create speech bubble for narration text
    const speechBubble = document.createElement('div');
    speechBubble.className = 'speech-bubble';
    document.body.appendChild(speechBubble);
    
    // Define narrations
    const narrations = [
        {
            id: 'intro',
            text: "Welcome to the enchanted forest. Take a moment to look around and enjoy the peaceful scenery."
        },
        {
            id: 'forest',
            text: "The trees sway gently in the breeze. Listen closely and you might hear the birds singing in the distance."
        },
        {
            id: 'campfire',
            text: "A warm campfire burns in the clearing. The stumps around it offer a place to rest and enjoy the warmth."
        }
    ];
    
    // Function to show the speech bubble
    function showSpeechBubble(text) {
        speechBubble.textContent = text;
        speechBubble.classList.add('visible');
    }
    
    // Function to hide the speech bubble
    function hideSpeechBubble() {
        speechBubble.classList.remove('visible');
    }
    
    // Initialize voice with better quality if available
    setTimeout(() => {
        // Try to find a higher quality voice
        const preferredVoices = [
            'Google UK English Female',
            'Microsoft Zira',
            'Microsoft David',
            'Google US English',
            'Samantha'
        ];
        
        for (const voiceName of preferredVoices) {
            if (speechManager.setVoice(voiceName)) {
                console.log(`Set voice to ${voiceName}`);
                break;
            }
        }
    }, 1000); // Wait a second for voices to load
    
    // Return object with methods to control speech
    return {
        speechManager,
        narrations,
        showSpeechBubble,
        hideSpeechBubble,
        
        // Play a specific narration by ID
        playNarration(id) {
            const narration = narrations.find(n => n.id === id);
            if (!narration) return false;
            
            speechManager.speak(narration.text, {
                onStart: () => showSpeechBubble(narration.text),
                onEnd: hideSpeechBubble
            });
            return true;
        },
        
        // Stop all narrations
        stopNarration() {
            speechManager.stop();
            hideSpeechBubble();
        },
        
        // Set the volume for speech
        setVolume(volume) {
            speechManager.setVolume(volume);
        }
    };
}

// Function to connect speech synthesis to the UI controls
function connectSpeechToControls(speech) {
    if (!speech) return;
    
    // Connect the narration buttons
    document.getElementById('play-intro')?.addEventListener('click', () => {
        speech.playNarration('intro');
    });
    
    document.getElementById('play-forest')?.addEventListener('click', () => {
        speech.playNarration('forest');
    });
    
    document.getElementById('play-campfire')?.addEventListener('click', () => {
        speech.playNarration('campfire');
    });
    
    // Connect voice volume slider
    const voiceVolumeSlider = document.getElementById('voice-volume');
    if (voiceVolumeSlider) {
        voiceVolumeSlider.addEventListener('input', (e) => {
            const volume = parseFloat(e.target.value);
            speech.setVolume(volume);
            
            // Update value display
            const valueDisplay = document.getElementById('voice-volume-value');
            if (valueDisplay) {
                valueDisplay.textContent = volume.toFixed(1);
            }
        });
    }
}

// For advanced usage: create a voice visualizer
function createVoiceVisualizer(speechManager, canvas) {
    if (!speechManager || !canvas || !window.AudioContext) return null;
    
    const ctx = canvas.getContext('2d');
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    
    // Connect to speech synthesis (implementation depends on browser support)
    try {
        // This is experimental and may not work in all browsers
        const source = audioContext.createMediaStreamSource(
            new MediaStream([speechManager.synth.getAudioTracks()[0]])
        );
        source.connect(analyser);
    } catch (e) {
        console.warn('Voice visualization not supported in this browser');
        return null;
    }
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    function draw() {
        if (!speechManager.isCurrentlySpeaking()) {
            requestAnimationFrame(draw);
            return;
        }
        
        requestAnimationFrame(draw);
        
        analyser.getByteFrequencyData(dataArray);
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#4CAF50';
        
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
            const barHeight = dataArray[i] / 2;
            
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            x += barWidth + 1;
        }
    }
    
    draw();
    
    return {
        analyser,
        start: draw,
        stop: () => {}  // Placeholder for cleanup if needed
    };
}