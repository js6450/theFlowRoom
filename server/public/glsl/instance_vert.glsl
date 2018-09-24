precision highp float;

uniform float time;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

attribute vec3 position;
attribute vec3 offset;
attribute vec4 color;
attribute float size;
attribute float lastTime;

varying vec3 vPosition;
varying vec4 vColor;
varying float vTime;


vec3 applyTransform( vec3 position, vec3 translation, vec4 quaternion, vec3 scale ) {
  position *= scale;
  position += 2.0 * cross( quaternion.xyz, cross( quaternion.xyz, position ) + quaternion.w * position );
  return position + translation;
}
// http://www.geeks3d.com/20141201/how-to-rotate-a-vertex-by-a-quaternion-in-glsl/
// vec3 applyQuaternionToVector( vec4 q, vec3 v ){
//   return v + 2.0 * cross( q.xyz, cross( q.xyz, v ) + q.w * v );
//}


void main(){
  vTime = time;
  float t = time - lastTime;
  float decaySpeed = 0.1;
  float sizeAdj = 1.0 - t * decaySpeed;
  if (sizeAdj <= 0.001) {
    sizeAdj = 0.001;
  }
  // POSITION & SCALE
  vec3 newPos = position * size * sizeAdj;
  vPosition = newPos + offset;
  vColor = color;

  // TRANSLATION
  float fluctX = sin( (time + vPosition.x * 0.05) * 0.18 ) * 0.2;
  float fluctZ = cos( (time + vPosition.z * 0.05) * 0.22 ) * 0.2;
  float fluctY = sin( time * 0.1 ) * 1.5;
  vec3 transPos = vec3(fluctX, fluctY, fluctZ) * t * 5.0;
  vPosition += transPos;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( vPosition, 1.0 );
}
