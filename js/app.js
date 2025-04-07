// Main application entry point
(function() {
    // Configuration
    const TOP_MARGIN = 0;
    
    // Setup container
    const container = createContainer(TOP_MARGIN);
    
    // Setup renderer
    const renderer = createRenderer(
        container, 
        window.innerWidth, 
        window.innerHeight - TOP_MARGIN
    );
    
    // Setup scene
    const scene = setupScene();
    
    // Setup camera
    const camera = new THREE.PerspectiveCamera(
        75, 
        window.innerWidth / (window.innerHeight - TOP_MARGIN), 
        0.1, 
        1000
    );
    camera.position.set(0, 20, 40);
    camera.lookAt(0, 0, 0);
    
    // Add terrain
    const terrain = createTerrain();
    scene.add(terrain);
    
    // Add trees
    addTrees(scene, 100);
    
    // Add clouds
    const clouds = createClouds(15);
    scene.add(clouds);
    
    // Setup resize handler
    setupResizeHandler(camera, renderer, TOP_MARGIN);
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Simple camera rotation
        const time = Date.now() * 0.0005;
        camera.position.x = Math.sin(time) * 50;
        camera.position.z = Math.cos(time) * 50;
        camera.lookAt(0, 0, 0);
        
        // Update clouds
        updateClouds(clouds);
        
        // Render the scene
        renderer.render(scene, camera);
    }
    
    // Start animation
    animate();
})();