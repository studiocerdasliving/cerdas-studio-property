import{t as e}from"./rolldown-runtime-WNZMJCWm.js";import{t}from"./shaderStore-Cl2MRAbk.js";import{t as n}from"./bonesDeclaration-sivlSgCs.js";import{t as r}from"./bonesVertex-DWSVcacV.js";import{t as i}from"./clipPlaneVertex-D3jaE5m5.js";import{t as a}from"./clipPlaneVertexDeclaration-DaSvjPsw.js";import{t as o}from"./bakedVertexAnimationDeclaration-D0RG7CJr.js";import{t as s}from"./instancesDeclaration-B6EXWX6l.js";import{t as c}from"./fogVertexDeclaration-DxdTuuKc.js";import{t as l}from"./instancesVertex-DKAC-ytI.js";import{t as u}from"./bakedVertexAnimation-BpDz4Zx_.js";import{t as d}from"./fogVertex-BGsS3ZEn.js";import{t as f}from"./vertexColorMixing-BpxPdjmt.js";var p=e({colorVertexShaderWGSL:()=>_}),m=`colorVertexShader`,h=`attribute position: vec3f;
#ifdef VERTEXCOLOR
attribute color: vec4f;
#endif
#include<bonesDeclaration>
#include<bakedVertexAnimationDeclaration>
#include<clipPlaneVertexDeclaration>
#include<fogVertexDeclaration>
#ifdef FOG
uniform view: mat4x4f;
#endif
#include<instancesDeclaration>
uniform viewProjection: mat4x4f;
#if defined(VERTEXCOLOR) || defined(INSTANCESCOLOR) && defined(INSTANCES)
varying vColor: vec4f;
#endif
#define CUSTOM_VERTEX_DEFINITIONS
@vertex
fn main(input : VertexInputs)->FragmentInputs {
#define CUSTOM_VERTEX_MAIN_BEGIN
#ifdef VERTEXCOLOR
var colorUpdated: vec4f=vertexInputs.color;
#endif
#include<instancesVertex>
#include<bonesVertex>
#include<bakedVertexAnimation>
var worldPos: vec4f=finalWorld* vec4f(vertexInputs.position,1.0);vertexOutputs.position=uniforms.viewProjection*worldPos;
#include<clipPlaneVertex>
#include<fogVertex>
#include<vertexColorMixing>
#define CUSTOM_VERTEX_MAIN_END
}`;t.ShadersStoreWGSL[m]||(t.ShadersStoreWGSL[m]=h);var g=[n,o,a,c,s,l,r,u,i,d,f];for(let e of g)t.IncludesShadersStoreWGSL[e.name]||(t.IncludesShadersStoreWGSL[e.name]=e.shader);var _={name:m,shader:h};export{p as n,_ as t};