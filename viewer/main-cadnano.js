'use strict'

var container = document.getElementById( 'container' )

var scene = new THREE.Scene()
// var camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, .1, 1000 )
var camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 1, 1000 )

camera.position.set( 50, 35, 50 )
var frustumSize = 100

var renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true })
renderer.setSize( window.innerWidth, window.innerHeight )
renderer.setPixelRatio( window.devicePixelRatio )
container.appendChild( renderer.domElement )

var controls = new THREE.OrbitControls( camera, renderer.domElement )

var resolution = new THREE.Vector2( window.innerWidth, window.innerHeight )
var origin = new THREE.Object3D()
var graph = new THREE.Object3D()

scene.add( origin )
scene.add( graph )

init()
render()

function makeLine( geo, c, width=0.01, object3d=graph ) {
  var g = new MeshLine()
  g.setGeometry( geo )

  var material = new MeshLineMaterial( {
    useMap: false,
    color: new THREE.Color( c ),
    opacity: 1,
    resolution: resolution,
    sizeAttenuation: !false,
    lineWidth: width,
    near: camera.near,
    far: camera.far
  })

  var mesh = new THREE.Mesh( g.geometry, material )
  object3d.add( mesh )

}

function init() {
  createOrigin()
  createLines()
}

function createOrigin() {
  var len = 4
  var xline = new THREE.Geometry()
  var yline = new THREE.Geometry()
  var zline = new THREE.Geometry()
  xline.vertices.push( new THREE.Vector3( 0, 0, 0 ) )
  xline.vertices.push( new THREE.Vector3( len, 0, 0 ) )
  yline.vertices.push( new THREE.Vector3( 0, 0, 0 ) )
  yline.vertices.push( new THREE.Vector3( 0, len, 0 ) )
  zline.vertices.push( new THREE.Vector3( 0, 0, 0 ) )
  zline.vertices.push( new THREE.Vector3( 0, 0, len ) )
  makeLine( xline, 0xff0000, 0.005, origin )
  makeLine( yline, 0x00ff00, 0.005, origin )
  makeLine( zline, 0x0000ff, 0.005, origin )
}

function createLines() {

  for ( var i = 0; i < DATA.length; i ++ ) {
    var line = new THREE.Geometry()
    var coords = DATA[i].coords
    for (var j = 0; j < coords.length; j++) {
      line.vertices.push(new THREE.Vector3(coords[j][0], coords[j][1], -coords[j][2]))
    }


    if (coords.length > 2000) {  // override scaffold color
      console.log(DATA[i].name)
    }
    makeLine( line, DATA[i].color )

  }
  
  var ctr = new THREE.Box3().setFromObject(graph).getCenter(new THREE.Vector3())
  graph.position.x = -ctr.x
  graph.position.y = -ctr.y
  graph.position.z = -ctr.z
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

 renderer.render( scene, camera )

}
