// Add trees to the scene
function addTrees(scene, count = 100) {
    // Create tree materials
    const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
    
    // Create tree geometries
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.4, 1.5, 5);
    const leavesGeometry = new THREE.ConeGeometry(1.5, 3, 6);
    
    // Place trees at random positions on the terrain
    for (let i = 0; i < count; i++) {
        // Random position within the terrain bounds
        const x = Math.random() * 100 - 50;
        const z = Math.random() * 100 - 50;
        
        // Find height at this position using function from terrain.js
        const height = getHeightAt(x, z);
        
        // Create trunk
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.set(x, height + 0.75, z);
        trunk.castShadow = true;
        scene.add(trunk);
        
        // Create leaves
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.set(x, height + 3, z);
        leaves.castShadow = true;
        scene.add(leaves);
    }
}