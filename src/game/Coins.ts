import { MeshBuilder, StandardMaterial, Color3, Vector3, Mesh } from '@babylonjs/core';

type CoinItem = {
  mesh: Mesh;
  lane: number;
  z: number;
  collected: boolean;
};

export class Coins {
  public coins: CoinItem[] = [];
  private readonly laneLocations = [-2.2, 0, 2.2];

  constructor(private scene: any) {}

  public spawnLine(lane: number, startZ: number) {
    for (let i = 0; i < 5; i++) {
      const coin = MeshBuilder.CreateCylinder(`coin_${lane}_${startZ}_${i}`, { diameter: 0.45, height: 0.12 }, this.scene);
      coin.rotation.x = Math.PI / 2;
      const mat = new StandardMaterial(`coinMat_${lane}_${startZ}_${i}`, this.scene);
      mat.diffuseColor = new Color3(0.98, 0.78, 0.13);
      coin.material = mat;
      const position = new Vector3(this.laneLocations[lane], 0.6, startZ - i * 3.4);
      coin.position.copyFrom(position);

      this.coins.push({ mesh: coin, lane, z: position.z, collected: false });
    }
  }

  public update(speed: number) {
    for (const coin of this.coins) {
      coin.z += speed;
      coin.mesh.position.z = coin.z;
      coin.mesh.rotation.y += 0.06;
    }
    this.coins = this.coins.filter((coin) => coin.z < 22 && !coin.collected);
  }

  public checkCollection(playerX: number, playerZ: number) {
    for (const coin of this.coins) {
      if (coin.collected) continue;
      const xDistance = Math.abs(playerX - coin.mesh.position.x);
      const zDistance = Math.abs(playerZ - coin.z);
      if (xDistance < 0.7 && zDistance < 1.4) {
        coin.collected = true;
        coin.mesh.dispose();
        return true;
      }
    }
    return false;
  }
}
