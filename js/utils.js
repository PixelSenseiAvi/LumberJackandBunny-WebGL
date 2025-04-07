// Create a container for our canvas with margin
function createContainer(topMargin) {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = topMargin + 'px';
    container.style.left = '0';
    container.style.right = '0';
    container.style.bottom = '0';
    document.body.appendChild(container);
    return container;
}

// Create a renderer
function createRenderer(container, width, height) {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);
    return renderer;
}

// Set up scene, camera, and lights
function setupScene() {
    // Create scene
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
    
    return scene;
}

// Handle window resize
function setupResizeHandler(camera, renderer, topMargin) {
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / (window.innerHeight - topMargin);
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight - topMargin);
    });
}