import{t as e}from"./rolldown-runtime-WNZMJCWm.js";import{t}from"./shaderStore-Cl2MRAbk.js";import{t as n}from"./bonesDeclaration-sivlSgCs.js";import{t as r}from"./bonesVertex-DWSVcacV.js";import{t as i}from"./morphTargetsVertex-rPdFjNnV.js";import{t as a}from"./morphTargetsVertexDeclaration-RuwklDoF.js";import{t as o}from"./morphTargetsVertexGlobal-a3k0WzLg.js";import{t as s}from"./morphTargetsVertexGlobalDeclaration-CYbzpXk1.js";import{t as c}from"./bakedVertexAnimationDeclaration-D0RG7CJr.js";import{t as l}from"./instancesDeclaration-B6EXWX6l.js";import{t as u}from"./instancesVertex-DKAC-ytI.js";import{t as d}from"./bakedVertexAnimation-BpDz4Zx_.js";var f=e({meshUVSpaceRendererVertexShaderWGSL:()=>g}),p=`meshUVSpaceRendererVertexShader`,m=`attribute position: vec3f;attribute normal: vec3f;attribute uv: vec2f;uniform projMatrix: mat4x4f;varying vDecalTC: vec2f;
#include<bonesDeclaration>
#include<bakedVertexAnimationDeclaration>
#include<morphTargetsVertexGlobalDeclaration>
#include<morphTargetsVertexDeclaration>[0..maxSimultaneousMorphTargets]
#include<instancesDeclaration>
@vertex
fn main(input : VertexInputs)->FragmentInputs {var positionUpdated: vec3f=vertexInputs.position;var normalUpdated: vec3f=vertexInputs.normal;
#include<morphTargetsVertexGlobal>
#include<morphTargetsVertex>[0..maxSimultaneousMorphTargets]
#include<instancesVertex>
#include<bonesVertex>
#include<bakedVertexAnimation>
var worldPos: vec4f=finalWorld* vec4f(positionUpdated,1.0);var normWorldSM: mat3x3f= mat3x3f(finalWorld[0].xyz,finalWorld[1].xyz,finalWorld[2].xyz);var vNormalW: vec3f;
#if defined(INSTANCES) && defined(THIN_INSTANCES)
vNormalW=normalUpdated/ vec3f(dot(normWorldSM[0],normWorldSM[0]),dot(normWorldSM[1],normWorldSM[1]),dot(normWorldSM[2],normWorldSM[2]));vNormalW=normalize(normWorldSM*vNormalW);
#else
#ifdef NONUNIFORMSCALING
normWorldSM=transposeMat3(inverseMat3(normWorldSM));
#endif
vNormalW=normalize(normWorldSM*normalUpdated);
#endif
var normalView: vec3f=normalize((uniforms.projMatrix* vec4f(vNormalW,0.0)).xyz);var decalTC: vec3f=(uniforms.projMatrix*worldPos).xyz;vertexOutputs.vDecalTC=decalTC.xy;vertexOutputs.position=vec4f(vertexInputs.uv*2.0-1.0,select(decalTC.z,2.,normalView.z>0.0),1.0);}`;t.ShadersStoreWGSL[p]||(t.ShadersStoreWGSL[p]=m);var h=[n,c,s,a,l,o,i,u,r,d];for(let e of h)t.IncludesShadersStoreWGSL[e.name]||(t.IncludesShadersStoreWGSL[e.name]=e.shader);var g={name:p,shader:m};export{f as n,g as t};