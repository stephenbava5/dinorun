import { MeshBuilder, StandardMaterial, Color3, Vector3 } from '@babylonjs/core';
export class Player {
    constructor(scene) {
        this.scene = scene;
        this.lane = 1;
        this.position = new Vector3(0, 0, 0);
        this.velocityY = 0;
        this.isJumping = false;
        this.isSliding = false;
        this.lives = 3;
        this.distance = 0;
        this.coins = 0;
        this.selectedSkin = 'default';
        this.isTripped = false;
        this.tripCount = 0;
        this.jumpPower = 0.48;
        this.gravity = -0.028;
        this.groundY = 0;
        const body = MeshBuilder.CreateBox('playerBody', { width: 1, height: 1.8, depth: 0.5 }, scene);
        const bodyMat = new StandardMaterial('playerBodyMat', scene);
        bodyMat.diffuseColor = Color3.FromHexString('#6a4b2a');
        body.material = bodyMat;
        const head = MeshBuilder.CreateSphere('playerHead', { diameter: 0.8 }, scene);
        const headMat = new StandardMaterial('playerHeadMat', scene);
        headMat.diffuseColor = Color3.FromHexString('#f4d6a3');
        head.material = headMat;
        head.parent = body;
        head.position = new Vector3(0, 1.05, 0);
        const hatBrim = MeshBuilder.CreateCylinder('playerHatBrim', { diameter: 1.1, height: 0.08 }, scene);
        const hatTop = MeshBuilder.CreateCylinder('playerHatTop', { diameter: 0.65, height: 0.4 }, scene);
        const hatMat = new StandardMaterial('playerHatMat', scene);
        hatMat.diffuseColor = Color3.FromHexString('#42311d');
        hatBrim.material = hatMat;
        hatTop.material = hatMat;
        hatBrim.parent = body;
        hatTop.parent = body;
        hatBrim.position = new Vector3(0, 1.46, 0);
        hatTop.position = new Vector3(0, 1.7, 0);
        const leftArm = MeshBuilder.CreateCylinder('playerArmL', { diameter: 0.22, height: 1 }, scene);
        const rightArm = MeshBuilder.CreateCylinder('playerArmR', { diameter: 0.22, height: 1 }, scene);
        const armMat = new StandardMaterial('playerArmMat', scene);
        armMat.diffuseColor = Color3.FromHexString('#c19f7f');
        leftArm.material = armMat;
        rightArm.material = armMat;
        leftArm.parent = body;
        rightArm.parent = body;
        leftArm.rotation.z = Math.PI / 2;
        rightArm.rotation.z = Math.PI / 2;
        leftArm.position = new Vector3(-0.75, 0.15, 0);
        rightArm.position = new Vector3(0.75, 0.15, 0);
        const pack = MeshBuilder.CreateBox('playerPack', { width: 0.7, height: 0.9, depth: 0.25 }, scene);
        const packMat = new StandardMaterial('playerPackMat', scene);
        packMat.diffuseColor = Color3.FromHexString('#4d3e29');
        pack.material = packMat;
        pack.parent = body;
        pack.position = new Vector3(-0.85, 0.18, -0.05);
        this.mesh = body;
        this.mesh.position = new Vector3(0, this.groundY + 0.9, 6);
        this.position.copyFrom(this.mesh.position);
    }
    update() {
        if (this.isJumping) {
            this.velocityY += this.gravity;
            this.position.y += this.velocityY;
            if (this.position.y <= this.groundY + 0.9) {
                this.position.y = this.groundY + 0.9;
                this.velocityY = 0;
                this.isJumping = false;
                this.isSliding = false;
            }
        }
        this.mesh.position.copyFrom(this.position);
    }
    moveLeft() {
        if (this.lane > 0) {
            this.lane -= 1;
            this.updateLanePosition();
        }
    }
    moveRight() {
        if (this.lane < 2) {
            this.lane += 1;
            this.updateLanePosition();
        }
    }
    jump() {
        if (!this.isJumping && !this.isSliding) {
            this.velocityY = this.jumpPower;
            this.isJumping = true;
        }
    }
    slide() {
        if (!this.isJumping && !this.isSliding) {
            this.isSliding = true;
            setTimeout(() => {
                this.isSliding = false;
            }, 650);
        }
    }
    updateLanePosition() {
        const laneOffset = (this.lane - 1) * 2.2;
        this.position.x = laneOffset;
    }
    reset() {
        this.lane = 1;
        this.position = new Vector3(0, this.groundY + 0.9, 6);
        this.velocityY = 0;
        this.isJumping = false;
        this.isSliding = false;
        this.lives = 3;
        this.distance = 0;
        this.coins = 0;
        this.selectedSkin = 'default';
        this.isTripped = false;
        this.tripCount = 0;
        this.updateLanePosition();
    }
}
//# sourceMappingURL=Player.js.map