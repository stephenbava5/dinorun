import { MeshBuilder, StandardMaterial, Color3, Vector3, Mesh } from '@babylonjs/core';

type ObstacleItem = {
  mesh: Mesh;
  lane: number;
  z: number;
  type: 'jump' | 'slide' | 'dodge';
};

export class Obstacles {
  public obstacles: ObstacleItem[] = [];
  private readonly lanePositions = [-2.2, 0, 2.2];

  constructor(private scene: any) {}

  public spawnObstacle(lane: number, startZ: number, type: 'jump' | 'slide' | 'dodge') {
    const obstacle = MeshBuilder.CreateBox(`obstacle_${lane}_${startZ}_${this.obstacles.length}`, { width: 1.8, height: type === 'slide' ? 0.7 : 1.6, depth: 1.5 }, this.scene);
    obstacle.position = new Vector3(this.lanePositions[lane], type === 'slide' ? 0.35 : 0.8, startZ);
    const mat = new StandardMaterial(`obsMat_${lane}_${startZ}`, this.scene);
    mat.diffuseColor = type === 'jump' ? new Color3(0.48, 0.24, 0.09) : type === 'slide' ? new Color3(0.52, 0.12, 0.12) : new Color3(0.3, 0.35, 0.21);
    obstacle.material = mat;

    this.obstacles.push({ mesh: obstacle, lane, z: startZ, type });
  }

  public update(speed: number) {
    for (const obstacle of this.obstacles) {
      obstacle.z += speed;
      obstacle.mesh.position.z = obstacle.z;
    }
    this.obstacles = this.obstacles.filter((obstacle) => obstacle.z < 22);
  }

  public checkCollision(playerX: number, playerY: number, playerZ: number, isSliding: boolean, isJumping: boolean) {
    for (const obstacle of this.obstacles) {
      const xDistance = Math.abs(playerX - obstacle.mesh.position.x);
      const zDistance = Math.abs(playerZ - obstacle.z);
      if (xDistance < 1 && zDistance < 1.4) {
        if (obstacle.type === 'jump' && isJumping) continue;
        if (obstacle.type === 'slide' && isSliding) continue;
        if (obstacle.type === 'dodge' && Math.abs(playerX - obstacle.mesh.position.x) > 0.8) continue;
        return obstacle;
      }
    }
    return null;
  }
}
