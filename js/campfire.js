// Campfire with particle effects
function createCampfire(scene, position = new THREE.Vector3(0, 0, 0)) {
    // Create a group to hold all campfire elements
    const campfireGroup = new THREE.Group();
    campfireGroup.position.copy(position);
    
    // Create the logs/wood for the fire
    createFireLogs(campfireGroup);
    
    // Create stones around the campfire
    createFireStones(campfireGroup);
    
    // Create fire particles
    const fireParticles = createFireParticles();
    campfireGroup.add(fireParticles);
    
    // Create smoke particles
    const smokeParticles = createSmokeParticles();
    campfireGroup.add(smokeParticles);
    
    // Add to scene
    scene.add(campfireGroup);
    
    // Return an object with the campfire group and update functions
    return {
        group: campfireGroup,
        fireParticles: fireParticles,
        smokeParticles: smokeParticles,
        update: function(delta) {
            // Update fire and smoke particle systems
            updateFireParticles(fireParticles, delta);
            updateSmokeParticles(smokeParticles, delta);
            
            // Create flickering light effect
            if (campfireGroup.userData.light) {
                const flickerIntensity = 1.0 + 0.2 * Math.sin(Date.now() * 0.01) + 0.1 * Math.random();
                campfireGroup.userData.light.intensity = flickerIntensity;
            }
        }
    };
}

// Create logs/wood for the campfire
function createFireLogs(group) {
    // Wood material
    const woodMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const darkWoodMaterial = new THREE.MeshLambertMaterial({ color: 0x654321 });
    
    // Create logs arranged in a teepee or pyramid
    for (let i = 0; i < 5; i++) {
        const logLength = 2 + Math.random() * 1.5;
        const logRadius = 0.15 + Math.random() * 0.1;
        
        const logGeometry = new THREE.CylinderGeometry(logRadius, logRadius, logLength, 6, 1);
        const log = new THREE.Mesh(logGeometry, i % 2 === 0 ? woodMaterial : darkWoodMaterial);
        
        // Position each log at an angle around the center
        const angle = (i / 5) * Math.PI * 2;
        const radiusFromCenter = 0.4;
        
        // Tilt the logs inward to form a teepee shape
        log.rotation.x = Math.PI / 2 - Math.PI / 6; // Tilt upward
        log.rotation.z = angle; // Rotate around
        
        // Position logs around the circle and slightly elevated
        log.position.x = Math.sin(angle) * radiusFromCenter;
        log.position.z = Math.cos(angle) * radiusFromCenter;
        log.position.y = logLength / 4; // Raise logs slightly
        
        // Cast shadows
        log.castShadow = true;
        
        group.add(log);
    }
    
    // Create some burnt/charred wood in the center
    const centerLogGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 8, 1);
    const charredMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x1a1a1a,
        emissive: 0x330000
    });
    const centerLog = new THREE.Mesh(centerLogGeometry, charredMaterial);
    centerLog.position.y = 0.05;
    centerLog.rotation.x = Math.PI / 2;
    group.add(centerLog);
    
    // Add a point light for the fire glow
    const fireLight = new THREE.PointLight(0xff6600, 1.5, 10, 2);
    fireLight.position.set(0, 1, 0);
    fireLight.castShadow = true;
    group.add(fireLight);
    
    // Store reference to the light for flickering animation
    group.userData.light = fireLight;
}

// Create stones arranged around the fire
function createFireStones(group) {
    const stoneMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
    const stoneDarkMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 });
    
    // Create a ring of stones
    const stoneCount = 8 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i < stoneCount; i++) {
        // Random stone size and shape
        const stoneSize = 0.2 + Math.random() * 0.15;
        const stoneGeometry = new THREE.SphereGeometry(stoneSize, 4, 3);
        
        // Deform the stone for a more natural look
        const vertices = stoneGeometry.attributes.position.array;
        for (let j = 0; j < vertices.length; j += 3) {
            vertices[j] *= 0.8 + Math.random() * 0.4;
            vertices[j + 1] *= 0.8 + Math.random() * 0.4;
            vertices[j + 2] *= 0.8 + Math.random() * 0.4;
        }
        stoneGeometry.computeVertexNormals();
        
        // Create the stone
        const stone = new THREE.Mesh(
            stoneGeometry, 
            Math.random() > 0.5 ? stoneMaterial : stoneDarkMaterial
        );
        
        // Position in a ring around the fire
        const angle = (i / stoneCount) * Math.PI * 2;
        const ringRadius = 1.2 + Math.random() * 0.3;
        
        stone.position.x = Math.sin(angle) * ringRadius;
        stone.position.z = Math.cos(angle) * ringRadius;
        stone.position.y = stoneSize * 0.5 - 0.1 * Math.random();
        
        // Random rotation
        stone.rotation.x = Math.random() * Math.PI;
        stone.rotation.y = Math.random() * Math.PI;
        stone.rotation.z = Math.random() * Math.PI;
        
        stone.castShadow = true;
        stone.receiveShadow = true;
        
        group.add(stone);
    }
}

// Create fire particles
function createFireParticles() {
    const particleCount = 200;
    const particleGeometry = new THREE.BufferGeometry();
    
    // Arrays to store particle data
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const lifetimes = new Float32Array(particleCount);
    const velocities = new Float32Array(particleCount * 3);
    
    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
        // Initial position (slightly randomized at the base of the fire)
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 0.5;
        positions[i3 + 1] = 0.1;
        positions[i3 + 2] = (Math.random() - 0.5) * 0.5;
        
        // Particle color - start with yellow/orange
        colors[i3] = 1.0;  // Red
        colors[i3 + 1] = 0.5 + Math.random() * 0.5; // Green (orange to yellow)
        colors[i3 + 2] = 0; // Blue
        
        // Random size
        sizes[i] = 0.5 + Math.random() * 0.5;
        
        // Lifetime (seconds)
        lifetimes[i] = Math.random() * 2;
        
        // Velocity (moving upward with slight randomization)
        velocities[i3] = (Math.random() - 0.5) * 0.5;
        velocities[i3 + 1] = 1 + Math.random() * 1;
        velocities[i3 + 2] = (Math.random() - 0.5) * 0.5;
    }
    
    // Add attributes to geometry
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Store additional attributes in userData for animation
    particleGeometry.userData = {
        lifetimes: lifetimes,
        velocities: velocities,
        initialPositions: positions.slice() // Copy for resetting
    };
    
    // Create particle material
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.5,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    });
    
    // Create the particles system
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    particles.renderOrder = 10; // Ensure particles render above other objects
    
    return particles;
}

// Create smoke particles
function createSmokeParticles() {
    const particleCount = 50;
    const particleGeometry = new THREE.BufferGeometry();
    
    // Arrays to store particle data
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const lifetimes = new Float32Array(particleCount);
    const velocities = new Float32Array(particleCount * 3);
    
    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
        // Initial position (above the fire)
        const i3 = i * 3;
        positions[i3] = (Math.random() - 0.5) * 0.2;
        positions[i3 + 1] = 1.5 + Math.random() * 0.5;
        positions[i3 + 2] = (Math.random() - 0.5) * 0.2;
        
        // Smoke color - grays
        const grayShade = 0.2 + Math.random() * 0.3;
        colors[i3] = grayShade;
        colors[i3 + 1] = grayShade;
        colors[i3 + 2] = grayShade;
        
        // Random size - smoke particles are larger
        sizes[i] = 1.5 + Math.random() * 1.5;
        
        // Lifetime (seconds) - smoke lasts longer
        lifetimes[i] = 2 + Math.random() * 3;
        
        // Velocity (slower upward drift with more sideways movement)
        velocities[i3] = (Math.random() - 0.5) * 0.3;
        velocities[i3 + 1] = 0.5 + Math.random() * 0.5;
        velocities[i3 + 2] = (Math.random() - 0.5) * 0.3;
    }
    
    // Add attributes to geometry
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Store additional attributes in userData for animation
    particleGeometry.userData = {
        lifetimes: lifetimes,
        velocities: velocities,
        initialPositions: positions.slice(), // Copy for resetting
        initialColors: colors.slice() // Copy for fading out
    };
    
    // Create particle material
    const particleMaterial = new THREE.PointsMaterial({
        size: 1.0,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.4,
        depthWrite: false,
    });
    
    // Create the particles system
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    
    return particles;
}

// Update fire particles
function updateFireParticles(particles, delta = 0.016) {
    const positions = particles.geometry.attributes.position.array;
    const colors = particles.geometry.attributes.color.array;
    const sizes = particles.geometry.attributes.size.array;
    const lifetimes = particles.geometry.userData.lifetimes;
    const velocities = particles.geometry.userData.velocities;
    const initialPositions = particles.geometry.userData.initialPositions;
    
    for (let i = 0; i < lifetimes.length; i++) {
        // Update lifetime
        lifetimes[i] -= delta;
        
        // If particle has died, reset it
        if (lifetimes[i] <= 0) {
            const i3 = i * 3;
            
            // Reset position to base
            positions[i3] = initialPositions[i3] + (Math.random() - 0.5) * 0.5;
            positions[i3 + 1] = initialPositions[i3 + 1];
            positions[i3 + 2] = initialPositions[i3 + 2] + (Math.random() - 0.5) * 0.5;
            
            // Reset color to orange/yellow
            colors[i3] = 1.0;
            colors[i3 + 1] = 0.5 + Math.random() * 0.5;
            colors[i3 + 2] = 0;
            
            // Reset size
            sizes[i] = 0.5 + Math.random() * 0.5;
            
            // Reset lifetime
            lifetimes[i] = Math.random() * 2;
            
            // Reset velocity with slight variation
            velocities[i3] = (Math.random() - 0.5) * 0.5;
            velocities[i3 + 1] = 1 + Math.random() * 1;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.5;
        } else {
            // Update position based on velocity
            const i3 = i * 3;
            positions[i3] += velocities[i3] * delta;
            positions[i3 + 1] += velocities[i3 + 1] * delta;
            positions[i3 + 2] += velocities[i3 + 2] * delta;
            
            // Make particles rise faster as they age
            velocities[i3 + 1] += delta * 0.5;
            
            // Add some wind drift
            velocities[i3] += (Math.random() - 0.5) * 0.1 * delta;
            velocities[i3 + 2] += (Math.random() - 0.5) * 0.1 * delta;
            
            // Fade from yellow/orange to red as particles rise
            const lifeRatio = lifetimes[i] / 2; // normalized lifetime
            colors[i3] = Math.min(1.0, 0.8 + lifeRatio * 0.2); // Red stays high
            colors[i3 + 1] = Math.max(0, lifeRatio * 0.7); // Green fades out
            
            // Adjust size as particles rise (first grow, then shrink)
            const sizeCurve = Math.sin(lifeRatio * Math.PI);
            sizes[i] = 0.3 + sizeCurve * 0.7;
        }
    }
    
    // Tell Three.js to update the particle attributes
    particles.geometry.attributes.position.needsUpdate = true;
    particles.geometry.attributes.color.needsUpdate = true;
    particles.geometry.attributes.size.needsUpdate = true;
}

// Update smoke particles
function updateSmokeParticles(particles, delta = 0.016) {
    const positions = particles.geometry.attributes.position.array;
    const colors = particles.geometry.attributes.color.array;
    const sizes = particles.geometry.attributes.size.array;
    const lifetimes = particles.geometry.userData.lifetimes;
    const velocities = particles.geometry.userData.velocities;
    const initialPositions = particles.geometry.userData.initialPositions;
    const initialColors = particles.geometry.userData.initialColors;
    
    for (let i = 0; i < lifetimes.length; i++) {
        // Update lifetime
        lifetimes[i] -= delta;
        
        // If particle has died, reset it
        if (lifetimes[i] <= 0) {
            const i3 = i * 3;
            
            // Reset position above fire
            positions[i3] = (Math.random() - 0.5) * 0.2;
            positions[i3 + 1] = 1.5 + Math.random() * 0.5;
            positions[i3 + 2] = (Math.random() - 0.5) * 0.2;
            
            // Reset color to initial gray shade
            colors[i3] = initialColors[i3];
            colors[i3 + 1] = initialColors[i3 + 1];
            colors[i3 + 2] = initialColors[i3 + 2];
            
            // Reset size
            sizes[i] = 1.5 + Math.random() * 1.5;
            
            // Reset lifetime
            lifetimes[i] = 2 + Math.random() * 3;
            
            // Reset velocity
            velocities[i3] = (Math.random() - 0.5) * 0.3;
            velocities[i3 + 1] = 0.5 + Math.random() * 0.5;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.3;
        } else {
            // Update position based on velocity
            const i3 = i * 3;
            positions[i3] += velocities[i3] * delta;
            positions[i3 + 1] += velocities[i3 + 1] * delta;
            positions[i3 + 2] += velocities[i3 + 2] * delta;
            
            // Add some wind drift
            velocities[i3] += (Math.random() - 0.5) * 0.05 * delta;
            velocities[i3 + 2] += (Math.random() - 0.5) * 0.05 * delta;
            
            // Slow down upward velocity slightly over time
            velocities[i3 + 1] *= 0.99;
            
            // Make smoke particles expand as they rise
            sizes[i] += delta * 0.1;
            
            // Fade smoke to transparent as it rises
            const fadeRatio = lifetimes[i] / 5;
            colors[i3] *= fadeRatio;
            colors[i3 + 1] *= fadeRatio;
            colors[i3 + 2] *= fadeRatio;
        }
    }
    
    // Tell Three.js to update the particle attributes
    particles.geometry.attributes.position.needsUpdate = true;
    particles.geometry.attributes.color.needsUpdate = true;
    particles.geometry.attributes.size.needsUpdate = true;
}