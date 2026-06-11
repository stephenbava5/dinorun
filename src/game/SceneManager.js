import { Engine, Scene, ArcRotateCamera, HemisphericLight, DirectionalLight, Color3, Color4, Vector3, MeshBuilder, StandardMaterial } from '@babylonjs/core';
export class SceneManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
        this.scene = new Scene(this.engine);
        this.scene.clearColor = new Color4(0.04, 0.08, 0.03, 1);
        this.camera = new ArcRotateCamera('camera', Math.PI / 2, Math.PI / 3.8, 18, new Vector3(0, 2, 0), this.scene);
        this.camera.attachControl(canvas, true);
        this.camera.lowerRadiusLimit = 10;
        this.camera.upperRadiusLimit = 25;
        this.camera.wheelDeltaPercentage = 0.01;
        this.camera.panningSensibility = 0;
        this.camera.upperBetaLimit = Math.PI / 2.2;
        this.camera.lowerBetaLimit = Math.PI / 4.2;
        this.camera.useAutoRotationBehavior = false;
        const sky = new HemisphericLight('skyLight', new Vector3(0.3, 1, 0.4), this.scene);
        sky.intensity = 0.95;
        const sun = new DirectionalLight('sun', new Vector3(-0.4, -1, 0.4), this.scene);
        sun.position = new Vector3(15, 30, -15);
        sun.intensity = 1.25;
        sun.shadowEnabled = true;
        const ground = MeshBuilder.CreateGround('ground', { width: 80, height: 300 }, this.scene);
        const groundMat = new StandardMaterial('groundMat', this.scene);
        groundMat.diffuseColor = new Color3(0.18, 0.23, 0.15);
        groundMat.specularColor = new Color3(0.1, 0.1, 0.1);
        ground.material = groundMat;
    }
    startRenderLoop(callback) {
        this.engine.runRenderLoop(() => {
            callback();
            this.scene.render();
        });
        window.addEventListener('resize', () => {
            this.engine.resize();
        });
    }
}
//# sourceMappingURL=SceneManager.js.map