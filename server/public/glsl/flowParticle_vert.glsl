varying vec3 vColor;
varying vec3 vPosition;

uniform float time;

attribute float size;

void main() {
  vColor = color * 0.20;
  vPosition = position;

  // TRANSLATION
  float fluctX = sin( (time + vPosition.x * 0.05) * 0.18 ) * 0.4;
  float fluctY = cos( (time + vPosition.y * 0.05) * 0.22 ) * 0.4;
  float fluctZ = 0.0; //sin( time * 0.1 ) * 0.35;
  vec3 transPos = vec3(fluctX, fluctY, fluctZ) * 50.0;
  vPosition += transPos;

  vec4 mvPosition = modelViewMatrix * vec4( vPosition, 1.0 );
  gl_PointSize = size * ( 300.0 / -mvPosition.z );
  gl_Position = projectionMatrix * mvPosition;
}
