// Controls panel functionality
class ControlsPanel {
    constructor(settings, updateCallbacks) {
        this.settings = settings;
        this.callbacks = updateCallbacks;
        this.isSimulationRunning = false;
        
        // Initialize UI controls
        this.initializeControls();
        this.setupEventListeners();
    }
    
    initializeControls() {
        // Set initial values for all controls
        this.setSliderValue('rotation-speed', this.settings.rotationSpeed);
        this.setSliderValue('camera-height', this.settings.cameraHeight);
        this.setSliderValue('camera-distance', this.settings.cameraDistance);
        this.setSliderValue('look-at-height', this.settings.lookAtHeight);
        
        this.setSliderValue('terrain-size', this.settings.terrainSize);
        this.setSliderValue('terrain-height', this.settings.terrainHeight);
        document.getElementById('terrain-color').value = this.settings.terrainColor;
        
        this.setSliderValue('tree-count', this.settings.treeCount);
        document.getElementById('trunk-color').value = this.settings.trunkColor;
        document.getElementById('leaves-color').value = this.settings.leavesColor;
        
        this.setSliderValue('cloud-count', this.settings.cloudCount);
        this.setSliderValue('cloud-speed', this.settings.cloudSpeed);
        this.setSliderValue('cloud-height', this.settings.cloudHeight);
        
        // Make sections collapsible
        this.setupCollapsibleSections();
        
        // Create fallback for missing play icon
        this.setupPlayIconFallback();
    }
    
    setupPlayIconFallback() {
        // Check if the play icon loaded correctly
        const startButton = document.getElementById('start-button');
        const img = startButton.querySelector('img');
        
        img.onerror = () => {
            // If image failed to load, use an SVG icon embedded in the JS
            const svgIcon = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="50" height="50" fill="#ffffff">
                    <path d="M8 5v14l11-7z"/>
                </svg>
            `;
            startButton.innerHTML = svgIcon;
        };
    }
    
    setSliderValue(id, value) {
        const slider = document.getElementById(id);
        const valueDisplay = document.getElementById(`${id}-value`);
        if (slider && valueDisplay) {
            slider.value = value;
            valueDisplay.textContent = value;
        }
    }
    
    setupCollapsibleSections() {
        const headers = document.querySelectorAll('.controls-header.chevron');
        
        headers.forEach(header => {
            const content = header.nextElementSibling;
            
            // Initially show all sections
            content.style.display = 'block';
            
            header.addEventListener('click', () => {
                header.classList.toggle('collapsed');
                content.style.display = content.style.display === 'none' ? 'block' : 'none';
            });
        });
    }
    
    setupEventListeners() {
        // Start button
        const startButton = document.getElementById('start-button');
        const startButtonLabel = document.querySelector('.start-button-label');
        
        if (startButton) {
            startButton.addEventListener('click', () => {
                this.isSimulationRunning = !this.isSimulationRunning;
                
                if (this.isSimulationRunning) {
                    startButtonLabel.textContent = 'Pause';
                    
                    // Change the icon to pause
                    startButton.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="50" height="50" fill="#ffffff">
                            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                        </svg>
                    `;
                    
                    if (this.callbacks.startSimulation) {
                        this.callbacks.startSimulation();
                    }
                } else {
                    startButtonLabel.textContent = 'Start';
                    
                    // Change back to play icon
                    startButton.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="50" height="50" fill="#ffffff">
                            <path d="M8 5v14l11-7z"/>
                        </svg>
                    `;
                    
                    if (this.callbacks.pauseSimulation) {
                        this.callbacks.pauseSimulation();
                    }
                }
                
                // Add pressing animation
                startButton.classList.add('pressed');
                setTimeout(() => {
                    startButton.classList.remove('pressed');
                }, 150);
            });
        }
        
        // Camera controls
        this.setupSliderListener('rotation-speed', value => {
            this.settings.rotationSpeed = value;
        });
        
        this.setupSliderListener('camera-height', value => {
            this.settings.cameraHeight = value;
        });
        
        this.setupSliderListener('camera-distance', value => {
            this.settings.cameraDistance = value;
        });
        
        this.setupSliderListener('look-at-height', value => {
            this.settings.lookAtHeight = value;
        });
        
        // Terrain controls
        this.setupSliderListener('terrain-size', value => {
            this.settings.terrainSize = value;
            if (this.callbacks.updateTerrain) {
                this.callbacks.updateTerrain();
            }
        });
        
        this.setupSliderListener('terrain-height', value => {
            this.settings.terrainHeight = value;
            if (this.callbacks.updateTerrain) {
                this.callbacks.updateTerrain();
            }
        });
        
        document.getElementById('terrain-color').addEventListener('input', e => {
            this.settings.terrainColor = e.target.value;
            if (this.callbacks.updateTerrainColor) {
                this.callbacks.updateTerrainColor();
            }
        });
        
        // Trees controls
        this.setupSliderListener('tree-count', value => {
            this.settings.treeCount = value;
            if (this.callbacks.regenerateTrees) {
                this.callbacks.regenerateTrees();
            }
        });
        
        document.getElementById('trunk-color').addEventListener('input', e => {
            this.settings.trunkColor = e.target.value;
            if (this.callbacks.updateTreeColors) {
                this.callbacks.updateTreeColors();
            }
        });
        
        document.getElementById('leaves-color').addEventListener('input', e => {
            this.settings.leavesColor = e.target.value;
            if (this.callbacks.updateTreeColors) {
                this.callbacks.updateTreeColors();
            }
        });
        
        // Clouds controls
        this.setupSliderListener('cloud-count', value => {
            this.settings.cloudCount = value;
            if (this.callbacks.regenerateClouds) {
                this.callbacks.regenerateClouds();
            }
        });
        
        this.setupSliderListener('cloud-speed', value => {
            this.settings.cloudSpeed = value;
            if (this.callbacks.updateCloudSpeed) {
                this.callbacks.updateCloudSpeed();
            }
        });
        
        this.setupSliderListener('cloud-height', value => {
            this.settings.cloudHeight = value;
            if (this.callbacks.updateCloudHeight) {
                this.callbacks.updateCloudHeight();
            }
        });
    }
    
    setupSliderListener(id, callback) {
        const slider = document.getElementById(id);
        const valueDisplay = document.getElementById(`${id}-value`);
        
        if (slider && valueDisplay) {
            slider.addEventListener('input', e => {
                const value = parseFloat(e.target.value);
                valueDisplay.textContent = value;
                if (callback) callback(value);
            });
        }
    }
}