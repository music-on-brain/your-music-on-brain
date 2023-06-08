import * as main from './index.js';

import * as THREE from './three/three.module.js';
import {OBJLoader} from './three/loaders/OBJLoader.js';


const NUM_PARTICLES = 1000;

const cubeEl = document.getElementById('cube');
let camera, scene, renderer;

let particles, cube, count = 0;

let mouseX = 0, mouseY = 0;

let width, height;

init();
animate();

function cubeClamp(x) {
  return Math.max(-0.5, Math.min(x, 0.5));
}

function coolRand() {
  return Math.random() ** 2;
}

const loader = new OBJLoader();

loader.load(
  'assets/models/cube.obj',
  function ( object ) {
    cube.add( object );
  },
  function ( xhr ) {
    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
  },
  function ( error ) {
    console.log( 'An error happened' );
  }
);

function init() {


  camera = new THREE.PerspectiveCamera( 21, window.innerWidth / window.innerHeight, 0.1, 10 );
  camera.position.z = 2;

  scene = new THREE.Scene();

  //

  cube = new THREE.Mesh();
  scene.add(cube);

  //

  const positions = new Float32Array( NUM_PARTICLES * 3 );
  const scales = new Float32Array( NUM_PARTICLES );

  for ( let i = 0; i < NUM_PARTICLES * 3; i += 3) {
    positions[ i ] = cubeClamp(coolRand() * 0.2 - 0.1 + 0.2*i / NUM_PARTICLES - 0.2);
    positions[ i + 1 ] = cubeClamp(coolRand() * 0.2 - 0.1 + Math.cos(3*i / NUM_PARTICLES)/2);
    positions[ i + 2 ] = cubeClamp(coolRand() * 0.2 - 0.1 + Math.sin(3*i / NUM_PARTICLES)/2);

    scales[ i / 3 ] = 0.1;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
  geometry.setAttribute( 'scale', new THREE.BufferAttribute( scales, 1 ) );

  const material = new THREE.ShaderMaterial( {

    uniforms: {
      color: { value: new THREE.Color( 0xffffff ) },
    },
    vertexShader: document.getElementById( 'vertexshader' ).textContent,
    fragmentShader: document.getElementById( 'fragmentshader' ).textContent

  } );

  //

  particles = new THREE.Points( geometry, material );
  cube.add(particles);

  //

  renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true} );
  renderer.setPixelRatio( window.devicePixelRatio );

  onWindowResize();

  cubeEl.appendChild( renderer.domElement );

  cubeEl.style.touchAction = 'none';
  cubeEl.addEventListener( 'pointermove', onPointerMove );

  //

  window.addEventListener( 'resize', onWindowResize );

}

function onWindowResize() {

  width = cubeEl.offsetWidth;
  height = cubeEl.offsetHeight;

  camera.aspect = 1;
  camera.updateProjectionMatrix();

  renderer.setSize(width, width);

}

//

function onPointerMove( event ) {

  if ( event.isPrimary === false ) return;

  mouseX = event.clientX - width;
  mouseY = event.clientY - height;

}

//

function animate() {

  requestAnimationFrame( animate );

  render();

}

function render() {
  cube.rotation.x = count / 100;
  cube.rotation.y = count / 100;
  cube.rotation.z = count / 100;
  // camera.position.x = ( mouseX - camera.position.x ) * .005;
  camera.position.z = 5 ;
  // camera.position.z = ( - mouseY - camera.position.y ) * .005;
  // camera.lookAt( scene.position );

  // const positions = particles.geometry.attributes.position.array;
  // const scales = particles.geometry.attributes.scale.array;

  // particles.geometry.attributes.position.needsUpdate = true;
  // particles.geometry.attributes.scale.needsUpdate = true;

  renderer.render( scene, camera );

  count += 0.1;

}