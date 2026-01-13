// 3D Rendering Module using Babylon.js
// Phase 2: 3D Rendering Foundation

import { 
  Engine, 
  Scene, 
  Vector3, 
  Color3, 
  Color4,
  HemisphericLight, 
  DirectionalLight,
  MeshBuilder,
  StandardMaterial,
  ArcRotateCamera,
  Mesh,
  Animation,
  EasingFunction,
  CubicEase
} from '@babylonjs/core';

// Module-level state
let engine: Engine | null = null;
let scene: Scene | null = null;
let player1Mesh: Mesh | null = null;
let player2Mesh: Mesh | null = null;
let arenaMesh: Mesh | null = null;

// Constants for 3D positioning
const PLAYER_1_POSITION = new Vector3(-3, 0, 0);
const PLAYER_2_POSITION = new Vector3(3, 0, 0);
const ARENA_SIZE = 10;

/**
 * Initialize the Babylon.js scene
 * @param canvas - HTMLCanvasElement to render to
 */
export function initScene(canvas: HTMLCanvasElement): void {
  // Create engine
  engine = new Engine(canvas, true, {
    preserveDrawingBuffer: true,
    stencil: true
  });

  // Create scene
  scene = new Scene(engine);
  scene.clearColor = new Color4(0.1, 0.1, 0.15, 1);

  // Create camera
  const camera = new ArcRotateCamera(
    'camera',
    Math.PI / 2,
    Math.PI / 3,
    15,
    Vector3.Zero(),
    scene
  );
  camera.attachControl(canvas, true);
  camera.lowerRadiusLimit = 10;
  camera.upperRadiusLimit = 20;

  // Lighting
  const hemisphericLight = new HemisphericLight(
    'hemisphericLight',
    new Vector3(0, 1, 0),
    scene
  );
  hemisphericLight.intensity = 0.6;

  const directionalLight = new DirectionalLight(
    'directionalLight',
    new Vector3(-1, -2, -1),
    scene
  );
  directionalLight.intensity = 0.8;
  directionalLight.position = new Vector3(5, 10, 5);

  // Create arena
  createArena();

  // Create player meshes
  createPlayerMeshes();

  // Start render loop
  engine.runRenderLoop(() => {
    if (scene) {
      scene.render();
    }
  });

  // Handle window resize
  window.addEventListener('resize', () => {
    if (engine) {
      engine.resize();
    }
  });
}

/**
 * Create the arena environment
 */
function createArena(): void {
  if (!scene) return;

  // Ground
  const ground = MeshBuilder.CreateGround(
    'ground',
    { width: ARENA_SIZE, height: ARENA_SIZE },
    scene
  );
  
  const groundMaterial = new StandardMaterial('groundMaterial', scene);
  groundMaterial.diffuseColor = new Color3(0.2, 0.2, 0.25);
  groundMaterial.specularColor = new Color3(0.1, 0.1, 0.1);
  ground.material = groundMaterial;

  // Arena border
  const border = MeshBuilder.CreateBox('border', { size: ARENA_SIZE }, scene);
  border.scaling = new Vector3(1.02, 0.1, 1.02);
  border.position.y = -0.05;
  const borderMaterial = new StandardMaterial('borderMaterial', scene);
  borderMaterial.diffuseColor = new Color3(0.3, 0.3, 0.4);
  borderMaterial.emissiveColor = new Color3(0.1, 0.1, 0.15);
  border.material = borderMaterial;

  arenaMesh = ground;
}

/**
 * Create player placeholder meshes
 */
function createPlayerMeshes(): void {
  if (!scene) return;

  // Player 1 - Blue sphere
  player1Mesh = MeshBuilder.CreateSphere('player1', { diameter: 1.5 }, scene);
  player1Mesh.position = PLAYER_1_POSITION.clone();
  
  const p1Material = new StandardMaterial('p1Material', scene);
  p1Material.diffuseColor = new Color3(0.2, 0.4, 0.8);
  p1Material.emissiveColor = new Color3(0.1, 0.2, 0.4);
  player1Mesh.material = p1Material;

  // Player 2 - Red sphere
  player2Mesh = MeshBuilder.CreateSphere('player2', { diameter: 1.5 }, scene);
  player2Mesh.position = PLAYER_2_POSITION.clone();
  
  const p2Material = new StandardMaterial('p2Material', scene);
  p2Material.diffuseColor = new Color3(0.8, 0.2, 0.2);
  p2Material.emissiveColor = new Color3(0.4, 0.1, 0.1);
  player2Mesh.material = p2Material;

  // Add subtle rotation animation
  if (scene) {
    scene.registerBeforeRender(() => {
      if (player1Mesh && player2Mesh) {
        player1Mesh.rotation.y += 0.005;
        player2Mesh.rotation.y -= 0.005;
      }
    });
  }
}

/**
 * Render the current game state in 3D
 * @param gameState - The current game state
 */
export function renderGameState(gameState: any): void {
  if (!scene || !player1Mesh || !player2Mesh) return;

  // Highlight active player
  const isActivePlayer1 = gameState.currentPlayer === 'player1';
  
  if (player1Mesh.material instanceof StandardMaterial) {
    player1Mesh.material.emissiveColor = isActivePlayer1 
      ? new Color3(0.2, 0.4, 0.8)
      : new Color3(0.1, 0.2, 0.4);
  }

  if (player2Mesh.material instanceof StandardMaterial) {
    player2Mesh.material.emissiveColor = isActivePlayer1
      ? new Color3(0.4, 0.1, 0.1)
      : new Color3(0.8, 0.2, 0.2);
  }

  // Scale meshes based on HP (visual feedback)
  const p1HpScale = Math.max(0.5, gameState.players.player1.hp / 100);
  const p2HpScale = Math.max(0.5, gameState.players.player2.hp / 100);

  player1Mesh.scaling = new Vector3(p1HpScale, p1HpScale, p1HpScale);
  player2Mesh.scaling = new Vector3(p2HpScale, p2HpScale, p2HpScale);

  // Show defend effect (shield visualization)
  if (gameState.players.player1.defendActive) {
    showDefendEffect('player1');
  } else {
    hideDefendEffect('player1');
  }

  if (gameState.players.player2.defendActive) {
    showDefendEffect('player2');
  } else {
    hideDefendEffect('player2');
  }
}

/**
 * Show damage effect animation
 * @param playerId - 'player1' or 'player2'
 */
export function showDamageEffect(playerId: 'player1' | 'player2'): void {
  if (!scene) return;

  const targetMesh = playerId === 'player1' ? player1Mesh : player2Mesh;
  if (!targetMesh) return;

  // Flash red
  const originalColor = (targetMesh.material as StandardMaterial).diffuseColor.clone();
  (targetMesh.material as StandardMaterial).diffuseColor = new Color3(1, 0, 0);

  // Shake animation
  const shakeAnimation = new Animation(
    'shake',
    'position.x',
    60,
    Animation.ANIMATIONTYPE_FLOAT,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );

  const keys = [
    { frame: 0, value: targetMesh.position.x },
    { frame: 10, value: targetMesh.position.x + 0.2 },
    { frame: 20, value: targetMesh.position.x - 0.2 },
    { frame: 30, value: targetMesh.position.x + 0.1 },
    { frame: 40, value: targetMesh.position.x - 0.1 },
    { frame: 50, value: targetMesh.position.x }
  ];

  shakeAnimation.setKeys(keys);

  const ease = new CubicEase();
  ease.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);
  shakeAnimation.setEasingFunction(ease);

  targetMesh.animations = [shakeAnimation];
  scene.beginAnimation(targetMesh, 0, 50, false, 1, () => {
    // Restore original color
    if (targetMesh.material instanceof StandardMaterial) {
      targetMesh.material.diffuseColor = originalColor;
    }
  });
}

/**
 * Show heal effect animation
 * @param playerId - 'player1' or 'player2'
 */
export function showHealEffect(playerId: 'player1' | 'player2'): void {
  if (!scene) return;

  const targetMesh = playerId === 'player1' ? player1Mesh : player2Mesh;
  if (!targetMesh) return;

  // Pulse green
  const originalEmissive = (targetMesh.material as StandardMaterial).emissiveColor.clone();
  (targetMesh.material as StandardMaterial).emissiveColor = new Color3(0, 1, 0);

  // Scale pulse animation
  const scaleAnimation = new Animation(
    'healPulse',
    'scaling',
    60,
    Animation.ANIMATIONTYPE_VECTOR3,
    Animation.ANIMATIONLOOPMODE_CONSTANT
  );

  const keys = [
    { frame: 0, value: targetMesh.scaling.clone() },
    { frame: 15, value: targetMesh.scaling.clone().scale(1.3) },
    { frame: 30, value: targetMesh.scaling.clone() }
  ];

  scaleAnimation.setKeys(keys);

  targetMesh.animations = [scaleAnimation];
  scene.beginAnimation(targetMesh, 0, 30, false, 1, () => {
    // Restore original emissive
    if (targetMesh.material instanceof StandardMaterial) {
      targetMesh.material.emissiveColor = originalEmissive;
    }
  });
}

/**
 * Show defend effect (creates a shield mesh)
 * @param playerId - 'player1' or 'player2'
 */
function showDefendEffect(playerId: 'player1' | 'player2'): void {
  if (!scene) return;

  const targetMesh = playerId === 'player1' ? player1Mesh : player2Mesh;
  if (!targetMesh) return;

  // Check if shield already exists
  const shieldName = `${playerId}_shield`;
  let shield = scene.getMeshByName(shieldName);

  if (!shield) {
    shield = MeshBuilder.CreateSphere(shieldName, { diameter: 2.2 }, scene);
    shield.parent = targetMesh;
    shield.position = Vector3.Zero();

    const shieldMaterial = new StandardMaterial('shieldMaterial', scene);
    shieldMaterial.diffuseColor = new Color3(0.5, 0.5, 1);
    shieldMaterial.emissiveColor = new Color3(0.2, 0.2, 0.5);
    shieldMaterial.alpha = 0.3;
    shieldMaterial.backFaceCulling = false;
    shield.material = shieldMaterial;
  }
}

/**
 * Hide defend effect
 * @param playerId - 'player1' or 'player2'
 */
function hideDefendEffect(playerId: 'player1' | 'player2'): void {
  if (!scene) return;

  const shieldName = `${playerId}_shield`;
  const shield = scene.getMeshByName(shieldName);
  
  if (shield) {
    shield.dispose();
  }
}

/**
 * Get the current scene
 */
export function getScene(): Scene | null {
  return scene;
}

/**
 * Get the current engine
 */
export function getEngine(): Engine | null {
  return engine;
}

/**
 * Dispose of the scene and engine
 */
export function disposeScene(): void {
  if (engine) {
    engine.stopRenderLoop();
  }
  
  if (scene) {
    scene.dispose();
  }
  
  if (engine) {
    engine.dispose();
  }

  // Reset state
  engine = null;
  scene = null;
  player1Mesh = null;
  player2Mesh = null;
  arenaMesh = null;
}