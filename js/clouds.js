// Create clouds
function createClouds(count = 15, baseHeight = 40) {
    const clouds = new THREE.Group();
    
    const cloudMaterial = new THREE.MeshLambertMaterial({
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.8
    });
    
    for (let i = 0; i < count; i++) {
        // Create a group for this cloud
        const cloud = new THREE.Group();
        
        // Random position
        const x = Math.random() * 200 - 100;
        const y = baseHeight + Math.random() * 20;
        const z = Math.random() * 200 - 100;
        
        cloud.position.set(x, y, z);
        
        // Create 3-5 spheres for this cloud
        const puffCount = 3 + Math.floor(Math.random() * 3);
        
        for (let j = 0; j < puffCount; j++) {
            const size = 3 + Math.random() * 6;
            const geometry = new THREE.SphereGeometry(size, 6, 6);
            const puff = new THREE.Mesh(geometry, cloudMaterial);
            
            // Position puff relative to cloud center
            puff.position.set(
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 3,
                (Math.random() - 0.5) * 10
            );
            
            cloud.add(puff);
        }
        
        // Add movement data
        cloud.userData = {
            speed: 0.02 + Math.random() * 0.05
        };
        
        clouds.add(cloud);
    }
    
    return clouds;
}

// Update cloud positions
function updateClouds(clouds, speedFactor = 1) {
    if (!clouds) return;
    
    clouds.children.forEach(cloud => {
        cloud.position.x += cloud.userData.speed * speedFactor;
        if (cloud.position.x > 100) {
            cloud.position.x = -100;
        }
    });
}