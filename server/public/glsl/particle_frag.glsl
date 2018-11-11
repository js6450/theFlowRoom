uniform sampler2D texture;
varying vec3 vColor;

void main() {
  gl_FragColor = vec4( vColor, 0.5 );
  gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );
}
