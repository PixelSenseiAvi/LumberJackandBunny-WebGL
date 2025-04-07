// Add trees to the scene with varied shapes and types
function addTrees(scene, count = 100, trunkColor = 0x8B4513, leavesColor = 0x228B22, terrainSize = 100, heightScale = 10) {
    // Create basic materials
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: trunkColor });
    const leavesMaterial = new THREE.MeshLambertMaterial({ color: leavesColor });
    
    // Create additional leaf material variations for visual variety
    const darkLeavesMaterial = new THREE.MeshLambertMaterial({ 
        color: new THREE.Color(leavesColor).multiplyScalar(0.8) 
    });
    const lightLeavesMaterial = new THREE.MeshLambertMaterial({ 
        color: new THREE.Color(leavesColor).multiplyScalar(1.2) 
    });
    
    // Array to store tree groups
    const trees = [];
    
    // Half the terrain size for position calculation
    const halfSize = terrainSize / 2;
    
    // Place trees at random positions on the terrain
    for (let i = 0; i < count; i++) {
        // Random position within the terrain bounds
        const x = Math.random() * terrainSize - halfSize;
        const z = Math.random() * terrainSize - halfSize;
        
        // Find height at this position using function from terrain.js
        const height = getHeightAt(x, z, heightScale);
        
        // Create a tree based on random type
        const treeGroup = createRandomTree(trunkMaterial, [leavesMaterial, darkLeavesMaterial, lightLeavesMaterial]);
        
        // Position the tree group
        treeGroup.position.set(x, height, z);
        
        // Random scale and rotation
        const scaleVariation = 0.5 + Math.random() * 1.5; // More variation in scale
        treeGroup.scale.set(
            scaleVariation * (0.8 + Math.random() * 0.4), // Slight x variation
            scaleVariation, 
            scaleVariation * (0.8 + Math.random() * 0.4)  // Slight z variation
        );
        treeGroup.rotation.y = Math.random() * Math.PI * 2;
        
        // Add to scene and store reference
        scene.add(treeGroup);
        trees.push(treeGroup);
    }
    
    return trees;
}

// Create a random tree of varied type
function createRandomTree(trunkMaterial, leavesMaterials) {
    const treeGroup = new THREE.Group();
    
    // Randomly select tree type
    const treeType = Math.random();
    
    // Randomly select a leaves material from the array
    const leavesMaterial = leavesMaterials[Math.floor(Math.random() * leavesMaterials.length)];
    
    if (treeType < 0.3) {
        // Conical pine tree (30% chance)
        createPineTree(treeGroup, trunkMaterial, leavesMaterial);
    } else if (treeType < 0.6) {
        // Blob/round tree (30% chance)
        createBlobTree(treeGroup, trunkMaterial, leavesMaterial);
    } else if (treeType < 0.8) {
        // Multi-layer tree (20% chance)
        createLayeredTree(treeGroup, trunkMaterial, leavesMaterial);
    } else {
        // Tall skinny tree (20% chance)
        createTallTree(treeGroup, trunkMaterial, leavesMaterial);
    }
    
    return treeGroup;
}

// Create a classic pine/conical tree
function createPineTree(group, trunkMaterial, leavesMaterial) {
    // Randomize trunk dimensions
    const trunkHeight = 1.5 + Math.random() * 1.0;
    const trunkRadius = 0.15 + Math.random() * 0.15;
    
    // Create trunk
    const trunkGeometry = new THREE.CylinderGeometry(trunkRadius * 0.8, trunkRadius, trunkHeight, 5);
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.set(0, trunkHeight/2, 0);
    trunk.castShadow = true;
    trunk.userData.type = 'trunk';
    group.add(trunk);
    
    // Randomize leaves dimensions
    const leavesHeight = 2.5 + Math.random() * 2.0;
    const leavesRadius = 1.3 + Math.random() * 0.7;
    
    // Create pine cone leaves
    const leavesGeometry = new THREE.ConeGeometry(leavesRadius, leavesHeight, 6);
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.set(0, trunkHeight + leavesHeight/2, 0);
    leaves.castShadow = true;
    leaves.userData.type = 'leaves';
    group.add(leaves);
    
    // Sometimes add a second smaller layer on top for detail
    if (Math.random() > 0.5) {
        const topLeavesGeometry = new THREE.ConeGeometry(leavesRadius * 0.6, leavesHeight * 0.5, 5);
        const topLeaves = new THREE.Mesh(topLeavesGeometry, leavesMaterial);
        topLeaves.position.set(0, trunkHeight + leavesHeight * 0.8, 0);
        topLeaves.castShadow = true;
        topLeaves.userData.type = 'leaves';
        group.add(topLeaves);
    }
}

// Create a blob/round tree
function createBlobTree(group, trunkMaterial, leavesMaterial) {
    // Randomize trunk dimensions
    const trunkHeight = 1.0 + Math.random() * 1.5;
    const trunkRadius = 0.2 + Math.random() * 0.2;
    
    // Create trunk
    const trunkGeometry = new THREE.CylinderGeometry(trunkRadius, trunkRadius * 1.3, trunkHeight, 5);
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.set(0, trunkHeight/2, 0);
    trunk.castShadow = true;
    trunk.userData.type = 'trunk';
    group.add(trunk);
    
    // Randomize blob dimensions
    const blobRadius = 1.8 + Math.random() * 1.2;
    const blobDetail = Math.floor(2 + Math.random() * 3); // Vary the geometry detail
    
    // Create blob leaves - slightly deform the sphere for more organic look
    const blobGeometry = new THREE.SphereGeometry(blobRadius, blobDetail + 5, blobDetail + 4);
    
    // Randomly deform the sphere slightly for more organic shape
    const vertices = blobGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        vertices[i] += (Math.random() - 0.5) * 0.2 * blobRadius;
        vertices[i + 1] += (Math.random() - 0.5) * 0.1 * blobRadius;
        vertices[i + 2] += (Math.random() - 0.5) * 0.2 * blobRadius;
    }
    blobGeometry.computeVertexNormals();
    
    const blob = new THREE.Mesh(blobGeometry, leavesMaterial);
    
    // Randomly position the blob slightly off-center for variety
    const xOffset = (Math.random() - 0.5) * 0.4;
    const zOffset = (Math.random() - 0.5) * 0.4;
    blob.position.set(xOffset, trunkHeight + blobRadius * 0.6, zOffset);
    blob.castShadow = true;
    blob.userData.type = 'leaves';
    group.add(blob);
    
    // Sometimes add smaller blobs for detail
    if (Math.random() > 0.7) {
        const smallBlobGeometry = new THREE.SphereGeometry(blobRadius * 0.5, blobDetail + 3, blobDetail + 2);
        const smallBlob = new THREE.Mesh(smallBlobGeometry, leavesMaterial);
        smallBlob.position.set(blobRadius * 0.5, trunkHeight + blobRadius * 0.8, blobRadius * 0.2);
        smallBlob.castShadow = true;
        smallBlob.userData.type = 'leaves';
        group.add(smallBlob);
    }
}

// Create a multi-layered tree
function createLayeredTree(group, trunkMaterial, leavesMaterial) {
    // Randomize trunk dimensions
    const trunkHeight = 2.0 + Math.random() * 2.0;
    const trunkRadius = 0.2 + Math.random() * 0.15;
    
    // Create trunk
    const trunkGeometry = new THREE.CylinderGeometry(trunkRadius * 0.7, trunkRadius, trunkHeight, 5);
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.set(0, trunkHeight/2, 0);
    trunk.castShadow = true;
    trunk.userData.type = 'trunk';
    group.add(trunk);
    
    // Create 2-4 layers of leaves
    const layers = 2 + Math.floor(Math.random() * 3);
    const baseRadius = 1.3 + Math.random() * 0.7;
    const layerHeight = 0.8 + Math.random() * 0.6;
    
    for (let i = 0; i < layers; i++) {
        // Each higher layer is smaller
        const layerScale = 1 - (i * 0.2);
        const layerGeometry = new THREE.ConeGeometry(baseRadius * layerScale, layerHeight, 6);
        const layer = new THREE.Mesh(layerGeometry, leavesMaterial);
        
        // Position each layer, higher layers are closer to the top
        const layerPosition = trunkHeight - (i * layerHeight * 0.5);
        layer.position.set(0, layerPosition, 0);
        layer.castShadow = true;
        layer.userData.type = 'leaves';
        group.add(layer);
    }
}

// Create a tall skinny tree
function createTallTree(group, trunkMaterial, leavesMaterial) {
    // Randomize trunk dimensions - taller and thinner
    const trunkHeight = 3.0 + Math.random() * 3.0;
    const trunkRadius = 0.15 + Math.random() * 0.1;
    
    // Create trunk
    const trunkGeometry = new THREE.CylinderGeometry(trunkRadius * 0.6, trunkRadius, trunkHeight, 5);
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.set(0, trunkHeight/2, 0);
    trunk.castShadow = true;
    trunk.userData.type = 'trunk';
    group.add(trunk);
    
    // Create a tall narrow set of leaves
    const leavesHeight = 3.0 + Math.random() * 1.5;
    const leavesRadius = 0.8 + Math.random() * 0.4;
    
    // Use a combination of shapes for more interesting foliage
    if (Math.random() > 0.5) {
        // Elongated conical leaves
        const leavesGeometry = new THREE.ConeGeometry(leavesRadius, leavesHeight, 5);
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.set(0, trunkHeight + leavesHeight/3, 0);
        leaves.castShadow = true;
        leaves.userData.type = 'leaves';
        group.add(leaves);
    } else {
        // Stretched cylindrical leaves
        const leavesGeometry = new THREE.CylinderGeometry(leavesRadius * 0.7, leavesRadius, leavesHeight, 5);
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.set(0, trunkHeight + leavesHeight/2, 0);
        leaves.castShadow = true;
        leaves.userData.type = 'leaves';
        group.add(leaves);
        
        // Add a small top
        const topGeometry = new THREE.SphereGeometry(leavesRadius * 0.7, 4, 4);
        const top = new THREE.Mesh(topGeometry, leavesMaterial);
        top.position.set(0, trunkHeight + leavesHeight, 0);
        top.castShadow = true;
        top.userData.type = 'leaves';
        group.add(top);
    }
}