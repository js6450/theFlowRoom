varying vec3 vColor;
varying vec3 vPosition;

uniform float time;

attribute float size;

void main() {
  vColor = color * 0.20;
  vPosition = position;

  // TRANSLATION
  float fluctX = cos( (time + vPosition.x * 0.06) * 0.07 ) * 0.5;
  float fluctY = sin( (time + vPosition.y * 0.06) * 0.10 ) * 0.5;
  float fluctZ = 0.0; //sin( time * 0.1 ) * 0.35;
  vec3 transPos = vec3(fluctX, fluctY, fluctZ) * 50.0;
  vPosition += transPos;

  vec4 mvPosition = modelViewMatrix * vec4( vPosition, 1.0 );
  gl_PointSize = size * ( 300.0 / -mvPosition.z );
  gl_Position = projectionMatrix * mvPosition;
}
