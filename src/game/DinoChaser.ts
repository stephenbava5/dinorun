import { MeshBuilder, StandardMaterial, Color3, Vector3, Mesh } from '@babylonjs/core';

export class DinoChaser {
  public mesh: Mesh;
  public lane = 1;
  public position = new Vector3(-2, 0, 10);
  public isCatching = false;

  constructor(private scene: any, initialLane: number, z: number) {
    this.mesh = MeshBuilder.CreateBox('dinoRoot', { size: 0.1 }, scene);
    this.mesh.isVisible = false;

    const mat = new StandardMaterial('dinoMat', scene);
    mat.diffuseColor = Color3.FromHexString('#2d5c31');

    const body = MeshBuilder.CreateSphere('dinoBody', { diameter: 1.3 }, scene);
    body.material = mat;
    body.parent = this.mesh;
    body.position = new Vector3(0, 0.2, 0);

    const head = MeshBuilder.CreateSphere('dinoHead', { diameter: 0.7 }, scene);
    head.material = mat;
    head.parent = this.mesh;
    head.position = new Vector3(0, 0.45, 0.85);

    const tail = MeshBuilder.CreateCylinder('dinoTail', { diameterTop: 0.18, diameterBottom: 0.28, height: 1.0 }, scene);
    tail.material = mat;
    tail.parent = this.mesh;
    tail.rotation.x = Math.PI / 2;
    tail.position = new Vector3(0, 0.05, -0.8);

    const legPositions = [
      new Vector3(-0.35, -0.45, 0.35),
      new Vector3(0.35, -0.45, 0.35),
      new Vector3(-0.35, -0.45, -0.35),
      new Vector3(0.35, -0.45, -0.35)
    ];

    for (let i = 0; i < legPositions.length; i++) {
      const leg = MeshBuilder.CreateBox(`dinoLeg${i}`, { width: 0.22, height: 0.55, depth: 0.22 }, scene);
      leg.material = mat;
      leg.parent = this.mesh;
      leg.position = legPositions[i];
    }

    const eyeWhiteMat = new StandardMaterial('dinoEyeWhiteMat', scene);
    eyeWhiteMat.diffuseColor = Color3.White();
    const eyeWhite = MeshBuilder.CreateSphere('dinoEyeWhite', { diameter: 0.14 }, scene);
    eyeWhite.material = eyeWhiteMat;
    eyeWhite.parent = this.mesh;
    eyeWhite.position = new Vector3(0.18, 0.55, 1.05);

    const eyePupilMat = new StandardMaterial('dinoEyePupilMat', scene);
    eyePupilMat.diffuseColor = Color3.Black();
    const eyePupil = MeshBuilder.CreateSphere('dinoEyePupil', { diameter: 0.08 }, scene);
    eyePupil.material = eyePupilMat;
    eyePupil.parent = this.mesh;
    eyePupil.position = new Vector3(0.18, 0.55, 1.12);

    this.lane = initialLane;
    this.position = new Vector3((this.lane - 1) * 2.2, 0.8, z);
    this.mesh.position.copyFrom(this.position);
  }

  public update(playerLane: number, playerSpeed: number, catchLevel = 0) {
    const targetX = (playerLane - 1) * 2.2;
    this.position.x += (targetX - this.position.x) * 0.05;
    const baseSpeed = playerSpeed * 0.90;
    let currentSpeed = baseSpeed;
    if (this.isCatching) {
      const catchBonus = Math.min(0.14, 0.08 + catchLevel * 0.04);
      currentSpeed = Math.max(playerSpeed * 1.01, playerSpeed * 1.02 + catchBonus);
    }
    this.position.z -= currentSpeed;
    if (this.position.z < 0) {
      this.position.z = 12;
    }
    this.mesh.position.copyFrom(this.position);
  }

  public setCatching(catching: boolean) {
    this.isCatching = catching;
  }

  public reset(z: number) {
    this.position = new Vector3((this.lane - 1) * 2.2, 0.8, z);
    this.isCatching = false;
    this.mesh.position.copyFrom(this.position);
  }

  public isNearPlayer(playerZ: number): boolean {
    return Math.abs(playerZ - this.position.z) < 1.5;
  }
}
