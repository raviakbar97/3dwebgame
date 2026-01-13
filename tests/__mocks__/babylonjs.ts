// Mock Babylon.js for testing
// This provides minimal mocks to allow tests to run without WebGL

export class Engine {
  constructor(canvas: any, antialias: boolean, options: any) {}
  runRenderLoop = jest.fn();
  stopRenderLoop = jest.fn();
  resize = jest.fn();
  dispose = jest.fn();
}

export class Scene {
  constructor(engine: any) {}
  clearColor: any;
  render = jest.fn();
  dispose = jest.fn();
  registerBeforeRender = jest.fn();
  getMeshByName = jest.fn(() => null);
  beginAnimation = jest.fn((target, start, end, loop, speed, callback) => {
    if (callback) callback();
  });
}

export class Vector3 {
  static Zero = () => new Vector3(0, 0, 0);
  static Up = () => new Vector3(0, 1, 0);
  
  constructor(public x: number = 0, public y: number = 0, public z: number = 0) {}
  
  clone = () => new Vector3(this.x, this.y, this.z);
  scale = (factor: number) => new Vector3(this.x * factor, this.y * factor, this.z * factor);
}

export class Color3 {
  constructor(public r: number = 0, public g: number = 0, public b: number = 0) {}
  
  clone = () => new Color3(this.r, this.g, this.b);
}

export class Color4 {
  constructor(public r: number = 0, public g: number = 0, public b: number = 0, public a: number = 1) {}
  
  clone = () => new Color4(this.r, this.g, this.b, this.a);
}

export class ArcRotateCamera {
  constructor(name: string, alpha: number, beta: number, radius: number, target: Vector3, scene: Scene) {}
  attachControl = jest.fn();
  setEasingMode = jest.fn();
}

export class HemisphericLight {
  constructor(name: string, direction: Vector3, scene: Scene) {}
  intensity = 1;
}

export class DirectionalLight {
  constructor(name: string, direction: Vector3, scene: Scene) {}
  intensity = 1;
  position = new Vector3();
}

export class MeshBuilder {
  static CreateGround = jest.fn((name: string, options: any, scene: Scene) => ({
    name,
    position: new Vector3(),
    scaling: new Vector3(1, 1, 1),
    animations: [],
    dispose: jest.fn()
  }));
  
  static CreateBox = jest.fn((name: string, options: any, scene: Scene) => ({
    name,
    position: new Vector3(),
    scaling: new Vector3(1, 1, 1),
    animations: [],
    dispose: jest.fn()
  }));
  
  static CreateSphere = jest.fn((name: string, options: any, scene: Scene) => ({
    name,
    position: new Vector3(),
    scaling: new Vector3(1, 1, 1),
    rotation: new Vector3(),
    parent: null,
    animations: [],
    material: {
      diffuseColor: new Color3(),
      emissiveColor: new Color3(),
      alpha: 1,
      backFaceCulling: true
    },
    dispose: jest.fn()
  }));
}

export class StandardMaterial {
  constructor(name: string, scene: Scene) {}
  diffuseColor = new Color3();
  emissiveColor = new Color3();
  specularColor = new Color3();
  alpha = 1;
  backFaceCulling = true;
}

export class Animation {
  constructor(public name: string, public targetProperty: string, public frameRate: number, public dataType: number, public loopMode: number) {}
  
  setKeys = jest.fn();
  setEasingFunction = jest.fn();
}

export class CubicEase {
  setEasingMode = jest.fn();
}

export class EasingFunction {
  static EASINGMODE_EASEINOUT = 0;
}

// Constants
export const Animation_ANIMATIONTYPE_FLOAT = 0;
export const Animation_ANIMATIONTYPE_VECTOR3 = 1;
export const Animation_ANIMATIONLOOPMODE_CONSTANT = 0;