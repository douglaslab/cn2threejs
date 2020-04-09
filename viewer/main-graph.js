'use strict'

var container = document.getElementById( 'container' )

var scene = new THREE.Scene()
var camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 1, 1000 )
camera.position.set( 50, 35, 50 )
var frustumSize = 100

var renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true })
renderer.setSize( window.innerWidth, window.innerHeight )
renderer.setPixelRatio( window.devicePixelRatio )
container.appendChild( renderer.domElement )

var controls = new THREE.OrbitControls( camera, renderer.domElement )
var clock = new THREE.Clock()

var colors = [
0xcc0000,
0xf74308,
0xf7931e,
0xaaaa00,
0x57bb00,
0x007200,
0x03b6a2,
0x1700de,
0x7300de,
0xb8056c,
0x333333,
0x888888
]

var resolution = new THREE.Vector2( window.innerWidth, window.innerHeight )
var graph = new THREE.Object3D()
scene.add( graph )

init()
render()

function makeLine( geo, c ) {

	var g = new MeshLine()
	g.setGeometry( geo )

	var material = new MeshLineMaterial( {
		useMap: false,
		color: new THREE.Color( colors[ c ] ),
		opacity: 1,
		resolution: resolution,
		sizeAttenuation: !false,
		lineWidth: .01,
		near: camera.near,
		far: camera.far
	})
	var mesh = new THREE.Mesh( g.geometry, material )
	graph.add( mesh )

}

function makeOriginLine( geo, c ) {

	var g = new MeshLine()
	g.setGeometry( geo )

	var material = new MeshLineMaterial( {
		useMap: false,
		color: new THREE.Color( c ),
		opacity: 1,
		resolution: resolution,
		sizeAttenuation: !false,
		lineWidth: .005,
		near: camera.near,
		far: camera.far
	})
	var mesh = new THREE.Mesh( g.geometry, material )
	graph.add( mesh )

}


function init() {

	createLines()

}

function createLines() {

	var line = new Float32Array( 600 )
	for( var j = 0; j < 200 * 3; j += 3 ) {
		line[ j ] = -30 + .1 * j
		line[ j + 1 ] = 5 * Math.sin( .01 *  j )
		line[ j + 2 ] = -20
	}
	makeLine( line, 0 )

	var line = new Float32Array( 600 )
	for( var j = 0; j < 200 * 3; j += 3 ) {
		line[ j ] = -30 + .1 * j
		line[ j + 1 ] = 5 * Math.cos( .02 *  j )
		line[ j + 2 ] = -10
	}
	makeLine( line, 1 )

	var line = new Float32Array( 600 )
	for( var j = 0; j < 200 * 3; j += 3 ) {
		line[ j ] = -30 + .1 * j
		line[ j + 1 ] = 5 * Math.sin( .01 *  j ) * Math.cos( .005 * j )
		line[ j + 2 ] = 0
	}
	makeLine( line, 2 )

	var line = new Float32Array( 600 )
	for( var j = 0; j < 200 * 3; j += 3 ) {
		line[ j ] = -30 + .1 * j
		line[ j + 1 ] = .02 * j + 5 * Math.sin( .01 *  j ) * Math.cos( .005 * j )
		line[ j + 2 ] = 10
	}
	makeLine( line, 4 )

	var line = new Float32Array( 600 )
	for( var j = 0; j < 200 * 3; j += 3 ) {
		line[ j ] = -30 + .1 * j
		line[ j + 1 ] = Math.exp( .005 * j )
		line[ j + 2 ] = 20
	}
	makeLine( line, 5 )

	var line = new THREE.Geometry()
	line.vertices.push( new THREE.Vector3( 0, 0, 0 ) )
	line.vertices.push( new THREE.Vector3( 10, 0, 0 ) )
	makeOriginLine( line, 0xff0000 )

	var line = new THREE.Geometry()
	line.vertices.push( new THREE.Vector3( 0, 0, 0 ) )
	line.vertices.push( new THREE.Vector3( 0, 10, 0 ) )
	makeOriginLine( line, 0x00ff00 )

	var line = new THREE.Geometry()
	line.vertices.push( new THREE.Vector3( 0, 0, 0 ) )
	line.vertices.push( new THREE.Vector3( 0, 0, 10 ) )
	makeOriginLine( line, 0x0000ff )

}

onWindowResize()

function onWindowResize() {

	var w = container.clientWidth
	var h = container.clientHeight

	var aspect = w / h

	camera.left   = - frustumSize * aspect / 2
	camera.right  =   frustumSize * aspect / 2
	camera.top    =   frustumSize / 2
	camera.bottom = - frustumSize / 2

	camera.updateProjectionMatrix()

	renderer.setSize( w, h )

	resolution.set( w, h )

}

window.addEventListener( 'resize', onWindowResize )

function render() {

	requestAnimationFrame( render )
	controls.update()
	// graph.rotation.y += .25 * clock.getDelta()

	renderer.render( scene, camera )

}
