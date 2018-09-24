precision highp float;

varying vec3 vPosition;
varying vec4 vColor;
varying float vTime;

void main() {
  vec4 color = vec4( vColor );
  // color.b += sin( vPosition.x * 10.0 + vTime ) * 0.5;
  gl_FragColor = color * 0.5;
}
