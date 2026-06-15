import{t as e}from"./rolldown-runtime-WNZMJCWm.js";import{t}from"./shaderStore-Cl2MRAbk.js";var n=e({highlightsPixelShader:()=>a}),r=`highlightsPixelShader`,i=`varying vec2 vUV;uniform sampler2D textureSampler;const vec3 RGBLuminanceCoefficients=vec3(0.2126,0.7152,0.0722);
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void) 
{vec4 tex=texture2D(textureSampler,vUV);vec3 c=tex.rgb;float luma=dot(c.rgb,RGBLuminanceCoefficients);gl_FragColor=vec4(pow(c,vec3(25.0-luma*15.0)),tex.a); }`;t.ShadersStore[r]||(t.ShadersStore[r]=i);var a={name:r,shader:i};export{n,a as t};