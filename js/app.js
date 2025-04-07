// Main application entry point
(function() {
    // Scene settings
    const settings = {
        // Basic configuration
        topMargin: 0,
        
        // Camera settings
        rotationSpeed: 0.0001,
        cameraHeight: 20,
        cameraDistance: 50,
        lookAtHeight: 0,
        
        // Terrain settings
        terrainSize: 100,
        terrainHeight: 10,
        terrainColor: '#44AA44',
        
        // Trees settings
        treeCount: 100,
        trunkColor: '#8B4513',
        leavesColor: '#228B22',
        
        // Clouds settings
        cloudCount: 15,
        cloudSpeed: 0.02,
        cloudHeight: 40,
        
        // Campfire settings
        fireIntensity: 1.5,
        fireColor: '#FF6600',
        smokeAmount: 50
    };
    
    // Simulation state
    let isSimulationRunning = false;
    let animationFrameId = null;
    let lastTime = 0;
    
    // Scene objects
    let terrainObject, trees = [], clouds;
    let campfire;
    
    // Setup container
    const container = document.getElementById('container');
    
    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight - settings.topMargin);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    
    // Setup scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1).normalize();
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);
    
    // Setup camera
    const camera = new THREE.PerspectiveCamera(
        75, 
        window.innerWidth / (window.innerHeight - settings.topMargin), 
        0.1, 
        1000
    );
    camera.position.set(0, settings.cameraHeight, settings.cameraDistance);
    camera.lookAt(0, settings.lookAtHeight, 0);
    
    // Add terrain
    function createInitialTerrain() {
        terrainObject = createTerrain(settings.terrainSize, settings.terrainHeight);
        terrainObject.material.color.set(settings.terrainColor);
        scene.add(terrainObject);
    }
    createInitialTerrain();
    
    // Add trees
    function createInitialTrees() {
        trees = addTrees(
            scene, 
            settings.treeCount,
            settings.trunkColor,
            settings.leavesColor,
            settings.terrainSize,
            settings.terrainHeight
        );
    }
    createInitialTrees();
    
    // Add clouds
    function createInitialClouds() {
        clouds = createClouds(settings.cloudCount, settings.cloudHeight);
        scene.add(clouds);
    }
    createInitialClouds();
    
    // Add campfire
    function createInitialCampfire() {
        // Find a good spot for the campfire (flat area, not too close to trees)
        const campfirePosition = findCampfirePosition();
        
        // Create the campfire at the found position
        campfire = createCampfire(scene, campfirePosition);
        
        // Apply initial settings
        updateFireIntensity(settings.fireIntensity);
        updateFireColor(settings.fireColor);
        updateSmokeAmount(settings.smokeAmount);
    }
    
    // Find a suitable location for the campfire
    function findCampfirePosition() {
        // Start with a position near the center, but slightly offset
        const posX = (Math.random() - 0.5) * 20;
        const posZ = (Math.random() - 0.5) * 20;
        
        // Get height at this position
        const posY = getHeightAt(posX, posZ, settings.terrainHeight);
        
        return new THREE.Vector3(posX, posY, posZ);
    }
    
    // Call after terrain and trees are created
    createInitialCampfire();
    
    // Create a static preview render
    function renderStaticPreview() {
        // Set static camera position
        camera.position.set(0, settings.cameraHeight, settings.cameraDistance);
        camera.lookAt(0, settings.lookAtHeight, 0);
        
        // Render the scene once
        renderer.render(scene, camera);
    }
    
    // Setup resize handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / (window.innerHeight - settings.topMargin);
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight - settings.topMargin);
        
        // If not running, update the static preview
        if (!isSimulationRunning) {
            renderStaticPreview();
        }
    });
    
    // Campfire control functions
    function updateFireIntensity(intensity) {
        if (campfire && campfire.group && campfire.group.userData.light) {
            // Update light intensity
            campfire.group.userData.light.intensity = intensity;
            
            // Update fire particle size and speed
            if (campfire.fireParticles) {
                const sizes = campfire.fireParticles.geometry.attributes.size.array;
                const velocities = campfire.fireParticles.geometry.userData.velocities;
                
                for (let i = 0; i < sizes.length; i++) {
                    // Scale size by intensity
                    sizes[i] = (0.5 + Math.random() * 0.5) * intensity;
                    
                    // Update velocity (make particles rise faster with higher intensity)
                    const i3 = i * 3;
                    velocities[i3 + 1] = (1 + Math.random()) * intensity;
                }
                campfire.fireParticles.geometry.attributes.size.needsUpdate = true;
            }
        }
    }
    
    function updateFireColor(colorHex) {
        if (campfire && campfire.fireParticles) {
            // Convert hex to RGB
            const color = new THREE.Color(colorHex);
            
            // Update fire particle colors
            const colors = campfire.fireParticles.geometry.attributes.color.array;
            
            for (let i = 0; i < colors.length / 3; i++) {
                const i3 = i * 3;
                // Base color with variation
                colors[i3] = color.r * (0.8 + Math.random() * 0.2); // Red
                colors[i3 + 1] = color.g * (0.7 + Math.random() * 0.3); // Green 
                colors[i3 + 2] = color.b * (0.7 + Math.random() * 0.3); // Blue
            }
            
            campfire.fireParticles.geometry.attributes.color.needsUpdate = true;
            
            // Update light color
            if (campfire.group && campfire.group.userData.light) {
                campfire.group.userData.light.color.set(colorHex);
            }
        }
    }
    
    function updateSmokeAmount(amount) {
        if (campfire && campfire.smokeParticles) {
            // Scale the particle count based on the amount
            const particleCount = Math.floor(amount);
            const smokeGeometry = campfire.smokeParticles.geometry;
            
            // Only use as many particles as specified by the amount
            if (smokeGeometry.userData.activeParticles !== particleCount) {
                smokeGeometry.userData.activeParticles = particleCount;
                
                // Reset positions for particles outside the active range
                const positions = smokeGeometry.attributes.position.array;
                const lifetimes = smokeGeometry.userData.lifetimes;
                
                for (let i = particleCount; i < positions.length / 3; i++) {
                    lifetimes[i] = -1; // Mark for reset on next update
                }
                
                smokeGeometry.attributes.position.needsUpdate = true;
            }
        }
    }
    
    // Update functions for controls
    const updateCallbacks = {
        startSimulation: function() {
            isSimulationRunning = true;
            lastTime = performance.now();
            if (!animationFrameId) {
                animate();
            }
            console.log("Simulation started");
        },
        
        pauseSimulation: function() {
            isSimulationRunning = false;
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            console.log("Simulation paused");
            
            // Render one more time to update any changes while paused
            renderStaticPreview();
        },
        
        updateTerrain: function() {
            // Remove existing terrain
            if (terrainObject) {
                scene.remove(terrainObject);
            }
            
            // Create new terrain with updated settings
            terrainObject = createTerrain(
                settings.terrainSize,
                settings.terrainHeight
            );
            terrainObject.material.color.set(settings.terrainColor);
            scene.add(terrainObject);
            
            // Regenerate trees to place them on the new terrain
            regenerateTrees();
            
            // Reposition campfire
            if (campfire && campfire.group) {
                const newPosition = findCampfirePosition();
                campfire.group.position.copy(newPosition);
            }
            
            // Update the view if paused
            if (!isSimulationRunning) {
                renderStaticPreview();
            }
        },
        
        updateTerrainColor: function() {
            if (terrainObject) {
                terrainObject.material.color.set(settings.terrainColor);
                
                // Update the view if paused
                if (!isSimulationRunning) {
                    renderStaticPreview();
                }
            }
        },
        
        regenerateTrees: function() {
            // Remove existing trees
            trees.forEach(tree => {
                scene.remove(tree);
            });
            trees = [];
            
            // Create new trees
            trees = addTrees(
                scene, 
                settings.treeCount,
                settings.trunkColor,
                settings.leavesColor,
                settings.terrainSize,
                settings.terrainHeight
            );
            
            // Update the view if paused
            if (!isSimulationRunning) {
                renderStaticPreview();
            }
        },
        
        updateTreeColors: function() {
            // Update colors of existing trees
            trees.forEach(treeGroup => {
                treeGroup.children.forEach(part => {
                    if (part.userData.type === 'trunk') {
                        part.material.color.set(settings.trunkColor);
                    } else if (part.userData.type === 'leaves') {
                        part.material.color.set(settings.leavesColor);
                    }
                });
            });
            
            // Update the view if paused
            if (!isSimulationRunning) {
                renderStaticPreview();
            }
        },
        
        regenerateClouds: function() {
            // Remove existing clouds
            if (clouds) {
                scene.remove(clouds);
            }
            
            // Create new clouds
            clouds = createClouds(
                settings.cloudCount,
                settings.cloudHeight
            );
            scene.add(clouds);
            
            // Update the view if paused
            if (!isSimulationRunning) {
                renderStaticPreview();
            }
        },
        
        updateCloudSpeed: function() {
            if (clouds) {
                clouds.children.forEach(cloud => {
                    cloud.userData.speed = settings.cloudSpeed * (0.5 + Math.random());
                });
            }
        },
        
        updateCloudHeight: function() {
            if (clouds) {
                clouds.children.forEach(cloud => {
                    cloud.position.y = settings.cloudHeight + Math.random() * 20;
                });
                
                // Update the view if paused
                if (!isSimulationRunning) {
                    renderStaticPreview();
                }
            }
        },
        
        // Campfire control callbacks
        updateFireIntensity: function(value) {
            updateFireIntensity(value);
            
            // Update the view if paused
            if (!isSimulationRunning) {
                renderStaticPreview();
            }
        },
        
        updateFireColor: function(value) {
            updateFireColor(value);
            
            // Update the view if paused
            if (!isSimulationRunning) {
                renderStaticPreview();
            }
        },
        
        updateSmokeAmount: function(value) {
            updateSmokeAmount(value);
            
            // Update the view if paused
            if (!isSimulationRunning) {
                renderStaticPreview();
            }
        }
    };
    
    // Create controls panel
    const controlsPanel = new ControlsPanel(settings, updateCallbacks);
    
    // Animation loop
    function animate(currentTime) {
        if (!isSimulationRunning) {
            return;
        }
        
        // Calculate delta time for smooth animations
        if (!currentTime) currentTime = performance.now();
        const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
        lastTime = currentTime;
        
        animationFrameId = requestAnimationFrame(animate);
        
        // Simple camera rotation with adjustable speed
        const time = Date.now() * settings.rotationSpeed;
        camera.position.x = Math.sin(time) * settings.cameraDistance;
        camera.position.z = Math.cos(time) * settings.cameraDistance;
        camera.position.y = settings.cameraHeight;
        camera.lookAt(0, settings.lookAtHeight, 0);
        
        // Update clouds with speed factor
        if (clouds) {
            updateClouds(clouds);
        }
        
        // Update campfire particles
        if (campfire) {
            campfire.update(deltaTime);
        }
        
        // Render the scene
        renderer.render(scene, camera);
    }
    
    // Initial render to show a static preview
    renderStaticPreview();
    
    // Start simulation initially (you can change this to false if you want to start paused)
    isSimulationRunning = true;
    lastTime = performance.now();
    animate();
})();