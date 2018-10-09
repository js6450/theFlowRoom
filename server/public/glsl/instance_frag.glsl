precision highp float;

varying vec3 vPosition;
varying vec4 vColor;
varying float vTime;

void main() {
  vec4 color = vec4( vColor );
  color.r += sin( (vPosition.x + vPosition.y) * 0.01 + vTime * 0.3 ) * 0.5;
  //color.g += 0.0;
  color.b += sin( vPosition.z * 0.02 + vTime * 0.4 ) * 0.5;
  float opacity = 0.9;
  gl_FragColor = color * opacity;
}
