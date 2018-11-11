precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform float time;

attribute vec3 position;
attribute vec3 offset;
attribute vec4 color;
attribute float size;
attribute float scale;
attribute float lastTime;
attribute float decaySpeed;
attribute float scatterSpeed;

varying vec3 vPosition;
varying vec4 vColor;
varying float vTime;

const float PI = 3.1415926535897932384626433832795;



// http://www.geeks3d.com/20141201/how-to-rotate-a-vertex-by-a-quaternion-in-glsl/
vec3 applyTransform( vec3 position, vec3 translation, vec4 quaternion, vec3 scale ) {
  position *= scale;
  position += 2.0 * cross( quaternion.xyz, cross( quaternion.xyz, position ) + quaternion.w * position );
  return position + translation;
}

vec4 quat_from_axis_angle(vec3 axis, float angle) {
  vec4 qr;
  float half_angle = (angle * 0.5) * 3.14159 / 180.0;
  qr.x = axis.x * sin(half_angle);
  qr.y = axis.y * sin(half_angle);
  qr.z = axis.z * sin(half_angle);
  qr.w = cos(half_angle);
  return qr;
}



void main(){
  // COLOR UPDATE
  vColor = color;

  // TIME UPDATE
  vTime = time;
  float t = time - lastTime;
  float sineTime = t * decaySpeed + PI * 0.2;
  if (sineTime >= PI) {
    sineTime = PI;
  }
  float sizeAdj = sin(sineTime);

  // POSITION & SCALE
  vec3 newPos = position * scale * size * sizeAdj;
  vPosition = newPos + offset;

  // TRANSLATION
  float fluctX = sin( (time + vPosition.x * 0.08) * 0.18 ) * 0.4;
  float fluctZ = cos( (time + vPosition.z * 0.08) * 0.22 ) * 0.4;
  float fluctY = sin( time * 0.1 ) * 0.35;
  vec3 transPos = vec3(fluctX, fluctY, fluctZ) * t * t * t * t * (0.01 + scatterSpeed); //0.03; // t * 5.0;
  //vec3 transPos = vec3(fluctX, fluctY, fluctZ) * t * t  * t * t * t * t * 0.01; // t * 0.5;
  vPosition += transPos;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( vPosition, 1.0 );
}
