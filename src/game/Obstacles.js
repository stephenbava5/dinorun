import { MeshBuilder, StandardMaterial, Color3, Vector3 } from '@babylonjs/core';
export class Obstacles {
    constructor(scene) {
        this.scene = scene;
        this.obstacles = [];
        this.lanePositions = [-2.2, 0, 2.2];
    }
    spawnObstacle(lane, startZ, type) {
        const obstacle = MeshBuilder.CreateBox(`obstacle_${lane}_${startZ}_${this.obstacles.length}`, { width: 1.8, height: type === 'slide' ? 0.7 : 1.6, depth: 1.5 }, this.scene);
        obstacle.position = new Vector3(this.lanePositions[lane], type === 'slide' ? 0.35 : 0.8, startZ);
        const mat = new StandardMaterial(`obsMat_${lane}_${startZ}`, this.scene);
        mat.diffuseColor = type === 'jump' ? new Color3(0.48, 0.24, 0.09) : type === 'slide' ? new Color3(0.52, 0.12, 0.12) : new Color3(0.3, 0.35, 0.21);
        obstacle.material = mat;
        this.obstacles.push({ mesh: obstacle, lane, z: startZ, type });
    }
    update(speed) {
        for (const obstacle of this.obstacles) {
            obstacle.z += speed;
            obstacle.mesh.position.z = obstacle.z;
        }
        this.obstacles = this.obstacles.filter((obstacle) => obstacle.z < 22);
    }
    checkCollision(playerX, playerY, playerZ, isSliding, isJumping) {
        for (const obstacle of this.obstacles) {
            const xDistance = Math.abs(playerX - obstacle.mesh.position.x);
            const zDistance = Math.abs(playerZ - obstacle.z);
            if (xDistance < 1 && zDistance < 1.4) {
                if (obstacle.type === 'jump' && isJumping)
                    continue;
                if (obstacle.type === 'slide' && isSliding)
                    continue;
                if (obstacle.type === 'dodge' && Math.abs(playerX - obstacle.mesh.position.x) > 0.8)
                    continue;
                return obstacle;
            }
        }
        return null;
    }
}
//# sourceMappingURL=Obstacles.js.map