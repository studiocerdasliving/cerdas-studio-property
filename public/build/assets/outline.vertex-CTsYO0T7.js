import{t as e}from"./rolldown-runtime-WNZMJCWm.js";import{t}from"./shaderStore-Cl2MRAbk.js";import{t as n}from"./bonesDeclaration-sivlSgCs.js";import{t as r}from"./bonesVertex-DWSVcacV.js";import{t as i}from"./clipPlaneVertex-D3jaE5m5.js";import{t as a}from"./clipPlaneVertexDeclaration-DaSvjPsw.js";import{t as o}from"./logDepthDeclaration-D7WB_x2I.js";import{t as s}from"./morphTargetsVertex-rPdFjNnV.js";import{t as c}from"./morphTargetsVertexDeclaration-RuwklDoF.js";import{t as l}from"./morphTargetsVertexGlobal-a3k0WzLg.js";import{t as u}from"./morphTargetsVertexGlobalDeclaration-CYbzpXk1.js";import{t as d}from"./bakedVertexAnimationDeclaration-D0RG7CJr.js";import{t as f}from"./instancesDeclaration-B6EXWX6l.js";import{t as p}from"./instancesVertex-DKAC-ytI.js";import{t as m}from"./bakedVertexAnimation-BpDz4Zx_.js";import{t as h}from"./logDepthVertex-C2kAJccQ.js";var g=e({outlineVertexShaderWGSL:()=>b}),_=`outlineVertexShader`,v=`attribute position: vec3f;attribute normal: vec3f;
#include<bonesDeclaration>
#include<bakedVertexAnimationDeclaration>
#include<morphTargetsVertexGlobalDeclaration>
#include<morphTargetsVertexDeclaration>[0..maxSimultaneousMorphTargets]
#include<clipPlaneVertexDeclaration>
uniform offset: f32;
#include<instancesDeclaration>
uniform viewProjection: mat4x4f;
#ifdef ALPHATEST
varying vUV: vec2f;uniform diffuseMatrix: mat4x4f; 
#ifdef UV1
attribute uv: vec2f;
#endif
#ifdef UV2
attribute uv2: vec2f;
#endif
#endif
#include<logDepthDeclaration>
#define CUSTOM_VERTEX_DEFINITIONS
@vertex
fn main(input: VertexInputs)->FragmentInputs {var positionUpdated: vec3f=vertexInputs.position;var normalUpdated: vec3f=vertexInputs.normal;
#ifdef UV1
var uvUpdated: vec2f=vertexInputs.uv;
#endif
#ifdef UV2
var uv2Updated: vec2f=vertexInputs.uv2;
#endif
#include<morphTargetsVertexGlobal>
#include<morphTargetsVertex>[0..maxSimultaneousMorphTargets]
var offsetPosition: vec3f=positionUpdated+(normalUpdated*uniforms.offset);
#include<instancesVertex>
#include<bonesVertex>
#include<bakedVertexAnimation>
var worldPos: vec4f=finalWorld*vec4f(offsetPosition,1.0);vertexOutputs.position=uniforms.viewProjection*worldPos;
#ifdef ALPHATEST
#ifdef UV1
vertexOutputs.vUV=(uniforms.diffuseMatrix*vec4f(uvUpdated,1.0,0.0)).xy;
#endif
#ifdef UV2
vertexOutputs.vUV=(uniforms.diffuseMatrix*vec4f(uv2Updated,1.0,0.0)).xy;
#endif
#endif
#include<clipPlaneVertex>
#include<logDepthVertex>
}
`;t.ShadersStoreWGSL[_]||(t.ShadersStoreWGSL[_]=v);var y=[n,d,u,c,a,f,o,l,s,p,r,m,i,h];for(let e of y)t.IncludesShadersStoreWGSL[e.name]||(t.IncludesShadersStoreWGSL[e.name]=e.shader);var b={name:_,shader:v};export{g as n,b as t};