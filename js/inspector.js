// Inspector GUI for the scene
class Inspector {
    constructor(scene, settings) {
        this.scene = scene;
        this.settings = settings;
        this.gui = new dat.GUI({ width: 300 });
        
        // Customize GUI appearance to look more like imgui
        this.styleGUI();
        
        // Create folders
        this.cameraFolder = this.gui.addFolder('Camera');
        this.terrainFolder = this.gui.addFolder('Terrain');
        this.treesFolder = this.gui.addFolder('Trees');
        this.cloudsFolder = this.gui.addFolder('Clouds');
        
        // Initialize controls
        this.initializeControls();
        
        // Open folders by default
        this.cameraFolder.open();
        this.terrainFolder.open();
        this.treesFolder.open();
        this.cloudsFolder.open();
    }
    
    styleGUI() {
        // Make GUI stay at top right
        this.gui.domElement.style.position = 'absolute';
        this.gui.domElement.style.top = this.settings.topMargin + 'px';
        this.gui.domElement.style.right = '0';
        
        // Customize style to look more like imgui
        const style = document.createElement('style');
        style.innerHTML = `
            .dg.main {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: rgba(37, 37, 38, 0.9);
                border: 1px solid #2c2c2c;
                border-radius: 3px;
            }
            .dg .title {
                background-color: rgba(64, 64, 64, 0.9);
            }
            .dg .cr.number input[type=text] {
                background-color: rgba(51, 51, 51, 0.9);
                border: 1px solid #111;
                border-radius: 2px;
                color: #ddd;
            }
            .dg .c select {
                background-color: rgba(51, 51, 51, 0.9);
                color: #ddd;
            }
            .dg .c .slider {
                background-color: rgba(51, 51, 51, 0.9);
                border-radius: 2px;
            }
            .dg .c .slider .slider-fg {
                background-color: #6a9fff;
            }
        `;
        document.head.appendChild(style);
    }
    
    initializeControls() {
        // Camera controls
        this.cameraFolder.add(this.settings, 'rotationSpeed', 0, 0.001).name('Rotation Speed').step(0.00001);
        this.cameraFolder.add(this.settings, 'cameraHeight', 10, 50).name('Camera Height').step(1);
        this.cameraFolder.add(this.settings, 'cameraDistance', 20, 100).name('Distance').step(1);
        this.cameraFolder.add(this.settings, 'lookAtHeight', -10, 20).name('Look At Height').step(1);
        
        // Terrain controls
        this.terrainFolder.add(this.settings, 'terrainSize', 50, 200).name('Size').step(10)
            .onChange(() => this.updateTerrain());
        this.terrainFolder.add(this.settings, 'terrainHeight', 1, 20).name('Height').step(0.5)
            .onChange(() => this.updateTerrain());
        this.terrainFolder.addColor(this.settings, 'terrainColor').name('Color')
            .onChange(() => this.updateTerrainColor());
        
        // Trees controls
        this.treesFolder.add(this.settings, 'treeCount', 0, 300).name('Count').step(10)
            .onChange(() => this.regenerateTrees());
        this.treesFolder.addColor(this.settings, 'trunkColor').name('Trunk Color')
            .onChange(() => this.updateTreeColors());
        this.treesFolder.addColor(this.settings, 'leavesColor').name('Leaves Color')
            .onChange(() => this.updateTreeColors());
        
        // Clouds controls
        this.cloudsFolder.add(this.settings, 'cloudCount', 0, 50).name('Count').step(5)
            .onChange(() => this.regenerateClouds());
        this.cloudsFolder.add(this.settings, 'cloudSpeed', 0, 0.1).name('Speed').step(0.01)
            .onChange(() => this.updateCloudSpeed());
        this.cloudsFolder.add(this.settings, 'cloudHeight', 20, 100).name('Height').step(5)
            .onChange(() => this.updateCloudHeight());
    }
    
    updateTerrain() {
        // Remove existing terrain
        if (this.settings.terrainObject) {
            this.scene.remove(this.settings.terrainObject);
        }
        
        // Create new terrain with updated settings
        this.settings.terrainObject = createTerrain(
            this.settings.terrainSize,
            this.settings.terrainHeight
        );
        this.scene.add(this.settings.terrainObject);
        
        // Regenerate trees to place them on the new terrain
        this.regenerateTrees();
    }
    
    updateTerrainColor() {
        if (this.settings.terrainObject) {
            this.settings.terrainObject.material.color.set(this.settings.terrainColor);
        }
    }
    
    regenerateTrees() {
        // Remove existing trees
        this.settings.trees.forEach(tree => {
            this.scene.remove(tree);
        });
        this.settings.trees = [];
        
        // Create new trees
        this.settings.trees = addTrees(
            this.scene, 
            this.settings.treeCount,
            this.settings.trunkColor,
            this.settings.leavesColor,
            this.settings.terrainSize,
            this.settings.terrainHeight
        );
    }
    
    updateTreeColors() {
        // Update colors of existing trees
        this.settings.trees.forEach(treeGroup => {
            treeGroup.children.forEach(part => {
                if (part.userData.type === 'trunk') {
                    part.material.color.set(this.settings.trunkColor);
                } else if (part.userData.type === 'leaves') {
                    part.material.color.set(this.settings.leavesColor);
                }
            });
        });
    }
    
    regenerateClouds() {
        // Remove existing clouds
        if (this.settings.clouds) {
            this.scene.remove(this.settings.clouds);
        }
        
        // Create new clouds
        this.settings.clouds = createClouds(
            this.settings.cloudCount,
            this.settings.cloudHeight
        );
        this.scene.add(this.settings.clouds);
    }
    
    updateCloudSpeed() {
        if (this.settings.clouds) {
            this.settings.clouds.children.forEach(cloud => {
                cloud.userData.speed = this.settings.cloudSpeed * (0.5 + Math.random());
            });
        }
    }
    
    updateCloudHeight() {
        if (this.settings.clouds) {
            this.settings.clouds.children.forEach(cloud => {
                cloud.position.y = this.settings.cloudHeight + Math.random() * 20;
            });
        }
    }
}