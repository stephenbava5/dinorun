import { MeshBuilder, StandardMaterial, Color3, Vector3, Mesh } from '@babylonjs/core';

export class Track {
  public segments: Mesh[] = [];

  constructor(private scene: any) {
    const pathColors = [
      { diffuse: '#00f6ff', emissive: '#05ecff' },
      { diffuse: '#4d7dff', emissive: '#85a9ff' }
    ];
    for (let i = 0; i < 8; i++) {
      const segment = MeshBuilder.CreateBox(`segment_${i}`, { width: 14, height: 0.2, depth: 24 }, scene);
      segment.position = new Vector3(0, -0.1, 4 - i * 24);
      const mat = new StandardMaterial(`segmentMat_${i}`, scene);
      const colorIndex = i % pathColors.length;
      mat.diffuseColor = Color3.FromHexString(pathColors[colorIndex].diffuse);
      mat.emissiveColor = Color3.FromHexString(pathColors[colorIndex].emissive);
      mat.specularColor = Color3.FromHexString('#ffffff');
      segment.material = mat;
      this.segments.push(segment);
    }
  }

  public update(speed: number) {
    for (const segment of this.segments) {
      segment.position.z += speed;
      if (segment.position.z > 16) {
        segment.position.z -= 8 * 24;
      }
    }
  }
}
