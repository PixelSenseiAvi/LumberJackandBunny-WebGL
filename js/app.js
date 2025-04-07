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
        cloudHeight: 40
    };
    
    // Simulation state
    let isSimulationRunning = false;
    let animationFrameId = null;
    
    // Scene objects
    let terrainObject, trees = [], clouds;
    
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
    
    // Update functions for controls
    const updateCallbacks = {
        startSimulation: function() {
            isSimulationRunning = true;
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
        }
    };
    
    // Create controls panel
    const controlsPanel = new ControlsPanel(settings, updateCallbacks);
    
    // Animation loop
    function animate() {
        if (!isSimulationRunning) {
            return;
        }
        
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
        
        // Render the scene
        renderer.render(scene, camera);
    }
    
    // Initial render to show a static preview
    renderStaticPreview();
    
    // Initially, the simulation is paused until the user clicks Start
    isSimulationRunning = false;
})();