import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xa0a0a0);

const canvas = document.querySelector('.webgl');
const canvas2 = document.querySelector('.webgl2');
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true

const camera2 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);
const controls = new OrbitControls(camera2, renderer.domElement);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x884844);
hemiLight.position.set(0, 20, 0);

function light() {
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1)
    dirLight.position.set(-60, 100, -10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = -50;
    dirLight.shadow.camera.left = -50;
    dirLight.shadow.camera.right = 50;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 200;
    dirLight.shadow.mapSize.width = 4096;
    dirLight.shadow.mapSize.height = 4096;
    scene.add(dirLight);

}

light();

let materialArray = [];
let texture_ft = new THREE.TextureLoader().load('texture/skybox/plain/sh_ft.png');
let texture_bk = new THREE.TextureLoader().load('texture/skybox/plain/sh_bk.png');
let texture_up = new THREE.TextureLoader().load('texture/skybox/plain/sh_up.png');
let texture_dn = new THREE.TextureLoader().load('texture/skybox/plain/sh_dn.png');
let texture_rt = new THREE.TextureLoader().load('texture/skybox/plain/sh_rt.png');
let texture_lf = new THREE.TextureLoader().load('texture/skybox/plain/sh_lf.png');

materialArray.push(new THREE.MeshBasicMaterial({ map: texture_ft }));
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_bk }));
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_up }));
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_dn }));
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_rt }));
materialArray.push(new THREE.MeshBasicMaterial({ map: texture_lf }));

for (let i = 0; i < 6; i++)
    materialArray[i].side = THREE.BackSide;

let skyboxGeo = new THREE.BoxGeometry(1000, 1000, 1000);
let skybox = new THREE.Mesh(skyboxGeo, materialArray);
scene.add(skybox);

var textureLoader = new THREE.TextureLoader();

const grassBaseColor = textureLoader.load("texture/grass2/base.jpg", function(texture) {

    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.offset.set(0, 0);
    texture.repeat.set(100, 100);

});

const grassNormalMap = textureLoader.load("texture/grass2/base.jpgNR.png", function(texture) {

    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.offset.set(0, 0);
    texture.repeat.set(100, 100);

});

const grassHeightMap = textureLoader.load("texture/grass2/base.jpgHGT.png", function(texture) {

    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.offset.set(0, 0);
    texture.repeat.set(100, 100);

});

const grassBumpMap = textureLoader.load("texture/grass2/base.jpgNR.png", function(texture) {

    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.offset.set(0, 0);
    texture.repeat.set(100, 100);

});

const material = new THREE.MeshPhongMaterial({
    map: grassBaseColor,
    normalMap: grassNormalMap,
    bumpMap: grassBumpMap,
    bumpScale: 0.8,
    displacementMap: grassHeightMap,
    displacementScale: 0.5,
    side: THREE.DoubleSide
})
const mesh = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), material);
mesh.rotation.x = -Math.PI / 2;
mesh.receiveShadow = true;
mesh.position.set(0, -0.27, 0);
scene.add(mesh);



const container = new THREE.Group();
scene.add(container);


const xAxis = new THREE.Vector3(1, 0, 0);
const tempCameraVector = new THREE.Vector3();
const tempModelVector = new THREE.Vector3();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);
camera.position.set(0, 2, -1);
const cameraOrigin = new THREE.Vector3(0, 1.5, 0);
camera.lookAt(cameraOrigin);
container.add(camera);


let model, skeleton, mixer, clock, numAnimations = 0,
    movingBack = false,
    movingLeft = false,
    movingRight = false,
    movingForward = false,
    mousedown = false;
clock = new THREE.Clock();
const allActions = [];
const baseActions = {
    idle: { weight: 1 },
    walk: { weight: 0 },
    run: { weight: 0 },
    back: { weight: 0 },
    left: { weight: 0 },
    right: { weight: 0 }
};

function setWeight(action, weight) {
    action.enabled = true;
    action.setEffectiveTimeScale(1);
    action.setEffectiveWeight(weight);
}

function activateAction(action) {
    const clip = action.getClip();
    const settings = baseActions[clip.name];
    setWeight(action, settings.weight);
    action.play();
}

const listener = new THREE.AudioListener();
camera.add(listener);


const sound = new THREE.PositionalAudio(listener);

var audioContext = new AudioContext();
window.addEventListener('mousedown', () => {

    audioContext.resume();
});
const audioLoader = new THREE.AudioLoader();
audioLoader.load('sounds/landing page.mp3', function(buffer) {
    sound.setBuffer(buffer);
    sound.setRefDistance(20);
    sound.play();
});
const loadingManager = new THREE.LoadingManager();
const loader = new GLTFLoader(loadingManager);
loader.load('./assets/images/Ashram.glb', function(glb) {
    console.log(glb);
    const root = glb.scene;
    root.scale.set(1.2, 1.2, 1.2);
    root.rotation.y = Math.PI / 2;
    root.position.x = -70;
    root.position.y = -6;
    root.position.z = -5;
    console.log(root.position);
    model.traverse(function(object) {
        if (object.isMesh) {
            object.castShadow = true;
        }
    });
    model.receiveShadow = true;
    // root.position.set(-50, 0.15, 0)
    root.add(sound);
    //group.add(root);
    scene.add(root);

})
loader.load('assets/character3.glb', function(gltf) {
    model = gltf.scene;
    //temp position
    model.position.y += 0.2;
    container.add(model);
    model.traverse(function(object) {
        if (object.isMesh) {
            object.castShadow = true;
        }
    });
    var progressBar = document.getElementById('progress-bar');
    loadingManager.onStart = function(url, itemsLoaded, itemsTotal) {
        // console.log("hello");
        // console.log('Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
    };
    loadingManager.onProgress = function(url, itemsLoaded, itemsTotal) {
        const progress = (itemsLoaded / itemsTotal * 100);
        progressBar.value = (itemsLoaded / itemsTotal * 100);
        // console.log(`Loading file: ${url}` + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.');
    };

    const progressBarContainer = document.querySelector('.progress-bar-container');
    loadingManager.onLoad = function() {
        console.log('Loading complete!');
        progressBarContainer.style.display = 'none';
        // Here you can perform any actions you want to take once all files are loaded.
    };

    skeleton = new THREE.SkeletonHelper(model);
    skeleton.visible = false;
    container.add(skeleton);
    const animations = gltf.animations;
    mixer = new THREE.AnimationMixer(model);

    let a = animations.length;
    for (let i = 0; i < a; ++i) {
        let clip = animations[i];
        const name = clip.name;
        if (baseActions[name]) {
            const action = mixer.clipAction(clip);
            activateAction(action);
            baseActions[name].action = action;
            allActions.push(action);
            numAnimations += 1;
        }
    }
});






const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(labelRenderer.domElement);
const button = document.createElement('button');
button.innerHTML = 'Experience';
button.style.position = 'absolute';
button.style.zIndex = '1';
button.style.top = '20px';
button.style.left = '20px';

document.body.appendChild(button);

button.addEventListener('click', () => {
    window.location.href = "./scene2.html";
});
var activeCam = camera;
const camButton = document.createElement('button');
camButton.innerHTML = 'Chnge Camera';
camButton.style.position = 'absolute';
camButton.style.zIndex = '1';
camButton.style.top = '80px';
camButton.style.left = '20px';

document.body.appendChild(camButton);

camButton.addEventListener('click', () => {
    if (activeCam === camera) {
        activeCam = camera2;
        model.visible = false;
        OrbitControls.enabled = true;
    } else {
        activeCam = camera;
        model.visible = true;
        OrbitControls.enabled = false;
    }
});
var settings = {
    yoga: "Option 1",
};
var timeout = 0;

function delayInit() {
    clearTimeout(timeout);
    timeout = setTimeout(init, 180);
}






window.addEventListener("keydown", (e) => {
    const { keyCode } = e;
    if (keyCode === 87 || keyCode === 38) {
        baseActions.idle.weight = 0;
        baseActions.run.weight = 5;
        baseActions.left.weight = 0;
        baseActions.right.weight = 0;
        baseActions.back.weight = 0;
        activateAction(baseActions.run.action);
        activateAction(baseActions.idle.action);
        activateAction(baseActions.left.action);
        activateAction(baseActions.right.action);
        activateAction(baseActions.back.action);
        movingForward = true;
    }
    if (keyCode === 65) {

        movingLeft = true;
    }

    if (keyCode === 68) {

        movingRight = true;
    }
    if (keyCode === 70) {

        if (activeCam === camera) {
            model.visible = !model.visible;
        }
    }
    if (keyCode === 83) {
        baseActions.idle.weight = 0;
        baseActions.run.weight = 0;
        baseActions.left.weight = 0;
        baseActions.right.weight = 0;
        baseActions.back.weight = 5;
        activateAction(baseActions.run.action);
        activateAction(baseActions.idle.action);
        activateAction(baseActions.left.action);
        activateAction(baseActions.right.action);
        activateAction(baseActions.back.action);

        movingBack = true;
    }
    if (keyCode === 89) {
        window.location.href = "./scene2.html";
    }

});

window.addEventListener("keyup", (e) => {
    const { keyCode } = e;
    if (keyCode === 87 || keyCode === 38) {
        baseActions.idle.weight = 1;
        baseActions.run.weight = 0;
        baseActions.left.weight = 0;
        baseActions.right.weight = 0;
        baseActions.back.weight = 0;
        activateAction(baseActions.run.action);
        activateAction(baseActions.idle.action);
        activateAction(baseActions.left.action);
        activateAction(baseActions.right.action);
        activateAction(baseActions.back.action);

        movingForward = false;
    }
    if (keyCode === 65) {
        baseActions.idle.weight = 1;

        movingLeft = false;
    }
    if (keyCode === 68) {
        baseActions.idle.weight = 1;

        movingRight = false;
    }
    if (keyCode === 83) {
        baseActions.idle.weight = 1;
        baseActions.run.weight = 0;
        baseActions.left.weight = 0;
        baseActions.right.weight = 0;
        baseActions.back.weight = 0;
        activateAction(baseActions.run.action);
        activateAction(baseActions.idle.action);
        activateAction(baseActions.left.action);
        activateAction(baseActions.right.action);
        activateAction(baseActions.back.action);

        movingBack = false;
    }
    if (keyCode === 32) {
        baseActions.idle.weight = 1;
        baseActions.run.weight = 0;
        baseActions.left.weight = 0;
        baseActions.right.weight = 0;
        baseActions.back.weight = 0;
        baseActions.pose1.weight = 0;
        activateAction(baseActions.pose1.action);
        activateAction(baseActions.run.action);
        activateAction(baseActions.idle.action);
        activateAction(baseActions.left.action);
        activateAction(baseActions.right.action);
        activateAction(baseActions.back.action);
    }
});

window.addEventListener("pointerdown", (e) => {
    mousedown = true;
});

window.addEventListener("pointerup", (e) => {
    mousedown = false;
});

window.addEventListener("pointermove", (e) => {
    if (mousedown) {
        const { movementX, movementY } = e;
        const offset = new THREE.Spherical().setFromVector3(
            camera.position.clone().sub(cameraOrigin)
        );
        const phi = offset.phi - movementY * 0.02;
        offset.theta -= movementX * 0.02;
        offset.phi = Math.max(0.01, Math.min(0.35 * Math.PI, phi));
        camera.position.copy(
            cameraOrigin.clone().add(new THREE.Vector3().setFromSpherical(offset))
        );
        camera.lookAt(container.position.clone().add(cameraOrigin));
    }
});



camera2.position.set(2, 10, 2)
camera2.lookAt(-70, -6, -5)
scene.add(camera2);
const animate = function() {
    requestAnimationFrame(animate);
    for (let i = 0; i < numAnimations; i++) {
        const action = allActions[i];
        const clip = action.getClip();
        labelRenderer.render(scene, camera);
        const settings = baseActions[clip.name];

    }

    if (mixer) {
        const mixerUpdateDelta = clock.getDelta();
        mixer.update(mixerUpdateDelta);
    }
    if (movingLeft) {
        container.rotateY(Math.PI / 200);
    }
    if (movingRight) {
        container.rotateY(-Math.PI / 200);
    }
    if (movingBack) {
        model.getWorldDirection(tempModelVector);
        const playerDirection = tempModelVector.setY(0).normalize();
        container.position.add(playerDirection.multiplyScalar(-0.05));
        // container.position.x += 0.05;
    }
    if (movingForward) {

        camera.getWorldDirection(tempCameraVector);
        const cameraDirection = tempCameraVector.setY(0).normalize();


        model.getWorldDirection(tempModelVector);
        const playerDirection = tempModelVector.setY(0).normalize();

        const cameraAngle = cameraDirection.angleTo(xAxis) * (cameraDirection.z > 0 ? 1 : -1);
        const playerAngle = playerDirection.angleTo(xAxis) * (playerDirection.z > 0 ? 1 : -1);

        const angleToRotate = playerAngle - cameraAngle;

        let sanitisedAngle = angleToRotate;
        if (angleToRotate > Math.PI) {
            sanitisedAngle = angleToRotate - 2 * Math.PI
        }
        if (angleToRotate < -Math.PI) {
            sanitisedAngle = angleToRotate + 2 * Math.PI
        }

        model.rotateY(
            Math.max(-0.05, Math.min(sanitisedAngle, 0.05))
        );
        container.position.add(cameraDirection.multiplyScalar(0.05));
        camera.lookAt(container.position.clone().add(cameraOrigin));
    }




    // renderer2.render(scene, camera2);
    renderer.render(scene, activeCam);


};

animate();