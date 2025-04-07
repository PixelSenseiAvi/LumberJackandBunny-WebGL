// Create a simple terrain
function createTerrain(size = 100, heightScale = 10) {
    const segments = 50;
    const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
    geometry.rotateX(-Math.PI / 2);
    
    // Apply noise to vertices
    const vertices = geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        // Simple noise function using sine waves
        const x = vertices[i];
        const z = vertices[i + 2];
        const height = getHeightNoise(x, z) * heightScale;
        
        vertices[i + 1] = height;
    }
    
    // Compute normals for proper lighting
    geometry.computeVertexNormals();
    
    // Simple green material for toon effect
    const material = new THREE.MeshLambertMaterial({ 
        color: 0x44AA44, 
        flatShading: true 
    });
    
    const terrain = new THREE.Mesh(geometry, material);
    terrain.receiveShadow = true;
    
    return terrain;
}

// The basic noise function for the terrain
function getHeightNoise(x, z) {
    return Math.sin(x * 0.05) * 
           Math.sin(z * 0.05) * 0.5 + 
           Math.sin(x * 0.1 + z * 0.1) * 0.2;
}

// Get height at a given x,z coordinate using the same algorithm as terrain generation
function getHeightAt(x, z, heightScale = 10) {
    return getHeightNoise(x, z) * heightScale;
}