import{t as e}from"./rolldown-runtime-WNZMJCWm.js";import{t}from"./shaderStore-Cl2MRAbk.js";import{t as n}from"./helperFunctions-Djh0sij1.js";import{t as r}from"./imageProcessingDeclaration-D9xTQOxH.js";import{t as i}from"./imageProcessingFunctions-BzShnS-E.js";var a=e({imageProcessingPixelShaderWGSL:()=>l}),o=`imageProcessingPixelShader`,s=`varying vUV: vec2f;var textureSamplerSampler: sampler;var textureSampler: texture_2d<f32>;
#include<imageProcessingDeclaration>
#include<helperFunctions>
#include<imageProcessingFunctions>
#define CUSTOM_FRAGMENT_DEFINITIONS
@fragment
fn main(input: FragmentInputs)->FragmentOutputs {var result: vec4f=textureSample(textureSampler,textureSamplerSampler,input.vUV);result=vec4f(max(result.rgb,vec3f(0.)),result.a);
#ifdef IMAGEPROCESSING
#ifndef FROMLINEARSPACE
result=vec4f(toLinearSpaceVec3(result.rgb),result.a);
#endif
result=applyImageProcessing(result);
#else
#ifdef FROMLINEARSPACE
result=applyImageProcessing(result);
#endif
#endif
fragmentOutputs.color=result;}`;t.ShadersStoreWGSL[o]||(t.ShadersStoreWGSL[o]=s);var c=[r,n,i];for(let e of c)t.IncludesShadersStoreWGSL[e.name]||(t.IncludesShadersStoreWGSL[e.name]=e.shader);var l={name:o,shader:s};export{a as n,l as t};