import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { GUI } from 'dat.gui'
import Stats from 'three/examples/jsm/libs/stats.module'
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';

import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
// Make a new scene
let scene = new THREE.Scene();
// Set background color of the scene to gray
scene.background = new THREE.Color(0x505050);

// Make a camera. note that far is set to 100, which is better for realworld sized environments
let camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);

camera.position.set(0, 4, 3);
scene.add(camera);

// Add some lights
var light = new THREE.DirectionalLight(0xffffff, 0.5);
light.position.set(1, 1, 1).normalize();
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.5))

const mesh = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshPhongMaterial({ color: 0x999999, depthWrite: false }));
mesh.rotation.x = -Math.PI / 2;
mesh.receiveShadow = true;
scene.add(mesh);
let model, skeleton, mixer, numAnimations;


const loadingManager = new THREE.LoadingManager();
const loader = new GLTFLoader(loadingManager);
loader.load('assets/yoga.glb', function(gltf) {

    model = gltf.scene;
    scene.add(model);

    model.traverse(function(object) {

        if (object.isMesh) object.castShadow = true;

    });




});

loader.load('assets/yoga.glb', function(gltf) {

    model = gltf.scene;
    scene.add(model);
    model.position.y += 0.22;
    model.position.z -= 1;
    model.position.x -= 5;
    model.rotateY(Math.PI);
    model.traverse(function(object) {

        if (object.isMesh) object.castShadow = true;

    });




    mixer = new THREE.AnimationMixer(model);


});
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

    scene.add(root);

})
var progressBar = document.getElementById('progress-bar');
loadingManager.onStart = function(url, itemsLoaded, itemsTotal) {

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
};
let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

renderer.xr.enabled = true;

renderer.setAnimationLoop(render);

document.body.appendChild(renderer.domElement);

document.body.appendChild(VRButton.createButton(renderer));
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

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
camera.position.set(-1, 2, 4);

function render(time) {
    const direction = new THREE.Vector3(0, 0, -1);
    // camera.localToWorld(direction);
    // camera.position.addScaledVector(direction, 0.1);
    renderer.render(scene, camera);
}