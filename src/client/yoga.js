import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { GUI } from 'dat.gui'
import Stats from 'three/examples/jsm/libs/stats.module'
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
let scene, camera, stats;
let model, model2, skeleton, mixer, clock;
var root;
const canvas = document.querySelector('.webgl');
let renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
});
const crossFadeControls = [];
let playbackSpeed = 0.8;
let currentBaseAction = 'idle';
const allActions = [];
const allActions2 = [];

var baseActions1 = {
    idle: { weight: 1 },
    GettingUp: { weight: 0 },
    UpwardDog: { weight: 0 },
    DownwardDog: { weight: 0 },
    dandasana: { weight: 0 },
};
var baseActions2 = {
    Hasta: { weight: 0 },
    utkatasan: { weight: 0 },
};
var baseActions = baseActions1
let panelSettings, numAnimations;

init();

function init() {

    clock = new THREE.Clock();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 500);
    scene = new THREE.Scene();
    // scene.background = new THREE.Color(0xa0a0a0);
    // scene.fog = new THREE.Fog(0xa0a0a0, 10, 50);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);
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

    let skyboxGeo = new THREE.BoxGeometry(200, 200, 200);
    let skybox = new THREE.Mesh(skyboxGeo, materialArray);
    scene.add(skybox);
    const dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(3, 10, 10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 2;
    dirLight.shadow.camera.bottom = -2;
    dirLight.shadow.camera.left = -2;
    dirLight.shadow.camera.right = 2;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 40;
    scene.add(dirLight);

    // ground

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false }));
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    mesh.position.y += 0.22;
    scene.add(mesh);
    const loadingManager = new THREE.LoadingManager();
    const loader = new GLTFLoader(loadingManager);
    var standing = true;
    if (standing) {
        baseActions = baseActions1;
        console.log("standing");
        loader.load('assets/yoga.glb', function(gltf) {

            model = gltf.scene;
            scene.add(model);
            model.position.y += 0.32;
            model.position.z -= 3;
            model.position.x -= 8;
            model.rotateY(Math.PI);
            model.traverse(function(object) {

                if (object.isMesh) object.castShadow = true;

            });

            skeleton = new THREE.SkeletonHelper(model);
            skeleton.visible = false;
            scene.add(skeleton);

            const animations = gltf.animations;
            mixer = new THREE.AnimationMixer(model);

            numAnimations = animations.length;

            for (let i = 0; i !== numAnimations; ++i) {

                let clip = animations[i];
                const name = clip.name;

                if (baseActions[name]) {

                    const action = mixer.clipAction(clip);
                    activateAction(action);
                    baseActions[name].action = action;
                    allActions.push(action);

                }

            }

            createPanel();

            animate();

        });
    } else {
        var baseActions = baseActions2;
        console.log("sitting");
        loader.load('assets/ashtanga.glb', function(gltf) {

            model = gltf.scene;
            scene.add(model);
            model.position.y += 0.22;
            model.position.z -= 60;
            model.position.x -= 5;
            model.rotateY(Math.PI);
            model.traverse(function(object) {

                if (object.isMesh) object.castShadow = true;

            });

            skeleton = new THREE.SkeletonHelper(model);
            skeleton.visible = false;
            scene.add(skeleton);

            const animations = gltf.animations;
            mixer = new THREE.AnimationMixer(model);

            numAnimations = animations.length;

            for (let i = 0; i !== numAnimations; ++i) {

                let clip = animations[i];
                const name = clip.name;

                if (baseActions[name]) {

                    const action = mixer.clipAction(clip);
                    activateAction(action);
                    baseActions[name].action = action;
                    allActions.push(action);

                }

            }

            createPanel();

            animate();

        });
    }

    loader.load('./assets/images/Ashram.glb', function(glb) {
        console.log(glb);
        root = glb.scene;
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

        scene.add(root);

    })
    var progressBar = document.getElementById('progress-bar');
    loadingManager.onStart = function(url, itemsLoaded, itemsTotal) {

    };
    loadingManager.onProgress = function(url, itemsLoaded, itemsTotal) {
        const progress = (itemsLoaded / itemsTotal * 100);
        progressBar.value = (itemsLoaded / itemsTotal * 100);
    };

    const progressBarContainer = document.querySelector('.progress-bar-container');
    loadingManager.onLoad = function() {
        progressBarContainer.style.display = 'none';
    };


    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;

    // camera

    camera.position.set(-10, 2, -15);
    const button = document.createElement('button');
    button.innerHTML = 'Explore';


    button.style.position = 'absolute';
    button.style.zIndex = '1';
    button.style.top = '20px';
    button.style.left = '20px';

    document.body.appendChild(button);

    button.addEventListener('click', () => {
        window.location.href = "./scene.html";
    });
    const yogabutton = document.createElement('button');
    yogabutton.innerHTML = 'Ashtanga';


    yogabutton.style.position = 'absolute';
    yogabutton.style.zIndex = '1';
    yogabutton.style.top = '80px';
    yogabutton.style.left = '20px';

    document.body.appendChild(yogabutton);

    yogabutton.addEventListener('click', () => {
        window.location.href = "./ashtanga.html";
    });
    const yogabutton2 = document.createElement('button');
    yogabutton2.innerHTML = 'Resorative';


    yogabutton2.style.position = 'absolute';
    yogabutton2.style.zIndex = '1';
    yogabutton2.style.top = '140px';
    yogabutton2.style.left = '20px';

    document.body.appendChild(yogabutton2);

    yogabutton2.addEventListener('click', () => {
        window.location.href = "./resorative.html";
    });
    const yogabutton3 = document.createElement('button');
    yogabutton3.innerHTML = 'Kundalini';


    yogabutton3.style.position = 'absolute';
    yogabutton3.style.zIndex = '1';
    yogabutton3.style.top = '200px';
    yogabutton3.style.left = '20px';

    document.body.appendChild(yogabutton3);

    yogabutton3.addEventListener('click', () => {
        window.location.href = "./kundalini.html";
    });
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.enableZoom = true;
    controls.target.set(-8, 1, -3);
    controls.update();

    // stats = new Stats();
    // container.appendChild(stats.dom);

    window.addEventListener('resize', onWindowResize);

}

function onPlaybackSpeedChanged(value) {
    playbackSpeed = value;
    mixer.timeScale = playbackSpeed;
}


function createPanel() {

    const panel = new GUI({ width: 310 });
    panelSettings = {
        options: "idle",
        camera: 'Flip it',
        'modify time scale': 1.0,
        'Playback Speed': playbackSpeed,
    };
    const folder1 = panel.addFolder('Asans');
    const folder2 = panel.addFolder('Camera');

    const playbackFolder = panel.addFolder('Playback');
    playbackFolder.add(panelSettings, 'Playback Speed', 0.1, 2, 0.1).onChange(onPlaybackSpeedChanged);


    // panel.add(panelSettings, 'options', ['upward', 'dandasana', 'downDog']);
    // panel.add(panelSettings, 'camera', 'Flip it');
    const baseNames = ['None', ...Object.keys(baseActions)];

    for (let i = 0, l = baseNames.length; i !== l; ++i) {

        const name = baseNames[i];
        const settings = baseActions[name];
        panelSettings[name] = function() {

            const currentSettings = baseActions[currentBaseAction];
            const currentAction = currentSettings ? currentSettings.action : null;
            const action = settings ? settings.action : null;

            if (currentAction !== action) {

                prepareCrossFade(currentAction, action, 0.35);

            }

        };

        crossFadeControls.push(folder1.add(panelSettings, name));
    }



    folder1.open();
    folder2.open();


    crossFadeControls.forEach(function(control) {

        control.setInactive = function() {

            control.domElement.classList.add('control-inactive');

        };

        control.setActive = function() {

            control.domElement.classList.remove('control-inactive');

        };

        const settings = baseActions[control.property];

        if (!settings || !settings.weight) {

            control.setInactive();

        }

    });

}

function activateAction(action) {

    const clip = action.getClip();
    const settings = baseActions[clip.name];
    setWeight(action, settings.weight);
    action.play();

}

function modifyTimeScale(speed) {

    mixer.timeScale = speed;

}

function prepareCrossFade(startAction, endAction, duration) {


    if (currentBaseAction === 'idle' || !startAction || !endAction) {

        executeCrossFade(startAction, endAction, duration);

    } else {

        synchronizeCrossFade(startAction, endAction, duration);

    }

    if (endAction) {

        const clip = endAction.getClip();
        currentBaseAction = clip.name;

    } else {

        currentBaseAction = 'None';

    }

    crossFadeControls.forEach(function(control) {

        const name = control.property;

        if (name === currentBaseAction) {

            control.setActive();

        } else {

            control.setInactive();

        }

    });

}

function synchronizeCrossFade(startAction, endAction, duration) {

    mixer.addEventListener('loop', onLoopFinished);

    function onLoopFinished(event) {

        if (event.action === startAction) {

            mixer.removeEventListener('loop', onLoopFinished);

            executeCrossFade(startAction, endAction, duration);

        }

    }

}

function executeCrossFade(startAction, endAction, duration) {

    if (endAction) {

        setWeight(endAction, 1);
        endAction.time = 0;

        if (startAction) {

            startAction.crossFadeTo(endAction, duration, true);

        } else {

            endAction.fadeIn(duration);

        }

    } else {
        startAction.fadeOut(duration);

    }

}

function setWeight(action, weight) {

    action.enabled = true;
    action.setEffectiveTimeScale(1);
    action.setEffectiveWeight(weight);

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

}

const listener = new THREE.AudioListener();
camera.add(listener);


var audioContext = new AudioContext();
window.addEventListener('mousedown', () => {

    audioContext.resume();
});
const dandasanaSound = new THREE.PositionalAudio(listener);
const sound = new THREE.PositionalAudio(listener);
const audioLoader = new THREE.AudioLoader();
audioLoader.load('sounds/meditation.mp3', function(buffer) {
    sound.setBuffer(buffer);
    sound.setRefDistance(20);
    sound.play();
});
audioLoader.load('sounds/dandasana.mp3', function(buffer) {
    dandasanaSound.setBuffer(buffer);
    dandasanaSound.setRefDistance(20);

});
const upwardSound = new THREE.PositionalAudio(listener);


audioLoader.load('sounds/upward facing dog.mp3', function(buffer) {
    upwardSound.setBuffer(buffer);
    upwardSound.setRefDistance(20);

});
const downSound = new THREE.PositionalAudio(listener);

audioLoader.load('sounds/downward facing dog.mp3', function(buffer) {
    downSound.setBuffer(buffer);
    downSound.setRefDistance(20);

});
const render = () => {
    renderer.render(scene, camera, );
    if (renderer.xr.isPresenting) {
        // Update camera position during VR sessions by manipulating the cameraContainer
        camera.rotateY(Math.PI)
    }
}
renderer.xr.enabled = true;

renderer.setAnimationLoop(render);

document.body.appendChild(renderer.domElement);

document.body.appendChild(VRButton.createButton(renderer));
renderer.xr.addEventListener('sessionstart', function() {

    // root.rotateY(Math.PI)
    root.position.x += 8
    root.position.z -= 0.4

    model.position.x += 8
    model.position.z -= 0.4
    model.rotateY(Math.PI / 2)

    camera.lookAt(model.position)
    console.log("vr", camera.position)


});



function animate() {

    requestAnimationFrame(animate);
    if (baseActions.dandasana.weight) {
        // console.log(baseActions.dandasana.weight);
        dandasanaSound.play();
        downSound.pause();
        upwardSound.pause();
    }
    if (baseActions.UpwardDog.weight) {
        // console.log(baseActions.UpwardDog.weight);
        dandasanaSound.pause();
        upwardSound.play();
        downSound.pause();
    }
    if (baseActions.DownwardDog.weight) {
        // console.log(baseActions.DownwardDog.weight);
        dandasanaSound.pause();
        downSound.play();
        upwardSound.pause();
    }
    for (let i = 0; i !== numAnimations; ++i) {

        const action = allActions[i];
        const clip = action.getClip();
        const settings = baseActions[clip.name];
        settings.weight = action.getEffectiveWeight();

    }

    const mixerUpdateDelta = clock.getDelta();
    mixer.update(mixerUpdateDelta * playbackSpeed);
    render();

}