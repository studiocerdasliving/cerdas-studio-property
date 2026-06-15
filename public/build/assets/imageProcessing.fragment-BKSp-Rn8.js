import{t as e}from"./rolldown-runtime-WNZMJCWm.js";import{t}from"./shaderStore-Cl2MRAbk.js";import{t as n}from"./helperFunctions-XZzpehR-.js";import{t as r}from"./imageProcessingDeclaration-BZzRO3oR.js";import{t as i}from"./imageProcessingFunctions-BbLUD4uP.js";var a=e({imageProcessingPixelShader:()=>l}),o=`imageProcessingPixelShader`,s=`varying vec2 vUV;uniform sampler2D textureSampler;
#include<imageProcessingDeclaration>
#include<helperFunctions>
#include<imageProcessingFunctions>
#define CUSTOM_FRAGMENT_DEFINITIONS
void main(void)
{vec4 result=texture2D(textureSampler,vUV);result.rgb=max(result.rgb,vec3(0.));
#ifdef IMAGEPROCESSING
#ifndef FROMLINEARSPACE
result.rgb=toLinearSpace(result.rgb);
#endif
result=applyImageProcessing(result);
#else
#ifdef FROMLINEARSPACE
result=applyImageProcessing(result);
#endif
#endif
gl_FragColor=result;}`;t.ShadersStore[o]||(t.ShadersStore[o]=s);var c=[r,n,i];for(let e of c)t.IncludesShadersStore[e.name]||(t.IncludesShadersStore[e.name]=e.shader);var l={name:o,shader:s};export{a as n,l as t};