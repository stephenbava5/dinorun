import { MeshBuilder, StandardMaterial, Color3, Vector3 } from '@babylonjs/core';
export class Coins {
    constructor(scene) {
        this.scene = scene;
        this.coins = [];
        this.laneLocations = [-2.2, 0, 2.2];
    }
    spawnLine(lane, startZ) {
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
    update(speed) {
        for (const coin of this.coins) {
            coin.z += speed;
            coin.mesh.position.z = coin.z;
            coin.mesh.rotation.y += 0.06;
        }
        this.coins = this.coins.filter((coin) => coin.z < 22 && !coin.collected);
    }
    checkCollection(playerX, playerZ) {
        for (const coin of this.coins) {
            if (coin.collected)
                continue;
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
//# sourceMappingURL=Coins.js.map