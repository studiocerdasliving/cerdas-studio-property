import{t as e}from"./rolldown-runtime-WNZMJCWm.js";import{t}from"./shaderStore-Cl2MRAbk.js";import{t as n}from"./bonesDeclaration-sivlSgCs.js";import{t as r}from"./bonesVertex-DWSVcacV.js";import{t as i}from"./morphTargetsVertex-rPdFjNnV.js";import{t as a}from"./morphTargetsVertexDeclaration-RuwklDoF.js";import{t as o}from"./morphTargetsVertexGlobal-a3k0WzLg.js";import{t as s}from"./morphTargetsVertexGlobalDeclaration-CYbzpXk1.js";import{t as c}from"./bakedVertexAnimationDeclaration-D0RG7CJr.js";import{t as l}from"./instancesDeclaration-B6EXWX6l.js";import{t as u}from"./instancesVertex-DKAC-ytI.js";import{t as d}from"./bakedVertexAnimation-BpDz4Zx_.js";var f=e({pickingVertexShaderWGSL:()=>g}),p=`pickingVertexShader`,m=`attribute position: vec3f;
#if defined(INSTANCES)
attribute instanceMeshID: f32;
#endif
#include<bonesDeclaration>
#include<bakedVertexAnimationDeclaration>
#include<morphTargetsVertexGlobalDeclaration>
#include<morphTargetsVertexDeclaration>[0..maxSimultaneousMorphTargets]
#include<instancesDeclaration>
uniform viewProjection: mat4x4f;
#if defined(INSTANCES)
flat varying vMeshID: f32;
#endif
@vertex
fn main(input : VertexInputs)->FragmentInputs {var positionUpdated: vec3f=vertexInputs.position;
#include<morphTargetsVertexGlobal>
#include<morphTargetsVertex>[0..maxSimultaneousMorphTargets]
#include<instancesVertex>
#include<bonesVertex>
#include<bakedVertexAnimation>
var worldPos: vec4f=finalWorld*vec4f(positionUpdated,1.0);vertexOutputs.position=uniforms.viewProjection*worldPos;
#if defined(INSTANCES)
vertexOutputs.vMeshID=vertexInputs.instanceMeshID;
#endif
}
`;t.ShadersStoreWGSL[p]||(t.ShadersStoreWGSL[p]=m);var h=[n,c,s,a,l,o,i,u,r,d];for(let e of h)t.IncludesShadersStoreWGSL[e.name]||(t.IncludesShadersStoreWGSL[e.name]=e.shader);var g={name:p,shader:m};export{f as n,g as t};