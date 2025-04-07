// Create a simple terrain
function createTerrain() {
    const size = 100;
    const segments = 50;
    const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
    geometry.rotateX(-Math.PI / 2);
    
    // Apply noise to vertices
    const vertices = geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        // Simple noise function using sine waves
        const x = vertices[i];
        const z = vertices[i + 2];
        const height = 
            Math.sin(x * 0.05) * 
            Math.sin(z * 0.05) * 5 + 
            Math.sin(x * 0.1 + z * 0.1) * 2;
        
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

// Get height at a given x,z coordinate using the same algorithm as terrain generation
function getHeightAt(x, z) {
    return Math.sin(x * 0.05) * 
           Math.sin(z * 0.05) * 5 + 
           Math.sin(x * 0.1 + z * 0.1) * 2;
}