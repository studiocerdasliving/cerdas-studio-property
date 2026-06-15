import{t as e}from"./rolldown-runtime-WNZMJCWm.js";import{t}from"./shaderStore-Cl2MRAbk.js";import{t as n}from"./bonesDeclaration-sivlSgCs.js";import{t as r}from"./bonesVertex-DWSVcacV.js";import{t as i}from"./clipPlaneVertex-D3jaE5m5.js";import{t as a}from"./clipPlaneVertexDeclaration-DaSvjPsw.js";import{t as o}from"./morphTargetsVertex-rPdFjNnV.js";import{t as s}from"./morphTargetsVertexDeclaration-RuwklDoF.js";import{t as c}from"./morphTargetsVertexGlobal-a3k0WzLg.js";import{t as l}from"./morphTargetsVertexGlobalDeclaration-CYbzpXk1.js";import{t as u}from"./bakedVertexAnimationDeclaration-D0RG7CJr.js";import{t as d}from"./instancesDeclaration-B6EXWX6l.js";import{t as f}from"./instancesVertex-DKAC-ytI.js";import{t as p}from"./bakedVertexAnimation-BpDz4Zx_.js";var m=e({depthVertexShaderWGSL:()=>v}),h=`depthVertexShader`,g=`attribute position: vec3f;
#include<bonesDeclaration>
#include<bakedVertexAnimationDeclaration>
#include<morphTargetsVertexGlobalDeclaration>
#include<morphTargetsVertexDeclaration>[0..maxSimultaneousMorphTargets]
#include<clipPlaneVertexDeclaration>
#include<instancesDeclaration>
uniform viewProjection: mat4x4f;uniform depthValues: vec2f;
#if defined(ALPHATEST) || defined(NEED_UV)
varying vUV: vec2f;uniform diffuseMatrix: mat4x4f;
#ifdef UV1
attribute uv: vec2f;
#endif
#ifdef UV2
attribute uv2: vec2f;
#endif
#endif
#ifdef STORE_CAMERASPACE_Z
uniform view: mat4x4f;varying vViewPos: vec4f;
#endif
varying vDepthMetric: f32;
#define CUSTOM_VERTEX_DEFINITIONS
@vertex
fn main(input : VertexInputs)->FragmentInputs {var positionUpdated: vec3f=vertexInputs.position;
#ifdef UV1
var uvUpdated: vec2f=vertexInputs.uv;
#endif
#ifdef UV2
var uv2Updated: vec2f=vertexInputs.uv2;
#endif
#include<morphTargetsVertexGlobal>
#include<morphTargetsVertex>[0..maxSimultaneousMorphTargets]
#include<instancesVertex>
#include<bonesVertex>
#include<bakedVertexAnimation>
var worldPos: vec4f=finalWorld* vec4f(positionUpdated,1.0);
#include<clipPlaneVertex>
vertexOutputs.position=uniforms.viewProjection*worldPos;
#ifdef STORE_CAMERASPACE_Z
vertexOutputs.vViewPos=uniforms.view*worldPos;
#else
#ifdef USE_REVERSE_DEPTHBUFFER
vertexOutputs.vDepthMetric=((-vertexOutputs.position.z+uniforms.depthValues.x)/(uniforms.depthValues.y));
#else
vertexOutputs.vDepthMetric=((vertexOutputs.position.z+uniforms.depthValues.x)/(uniforms.depthValues.y));
#endif
#endif
#if defined(ALPHATEST) || defined(BASIC_RENDER)
#ifdef UV1
vertexOutputs.vUV= (uniforms.diffuseMatrix* vec4f(uvUpdated,1.0,0.0)).xy;
#endif
#ifdef UV2
vertexOutputs.vUV= (uniforms.diffuseMatrix* vec4f(uv2Updated,1.0,0.0)).xy;
#endif
#endif
}
`;t.ShadersStoreWGSL[h]||(t.ShadersStoreWGSL[h]=g);var _=[n,u,l,s,a,d,c,o,f,r,p,i];for(let e of _)t.IncludesShadersStoreWGSL[e.name]||(t.IncludesShadersStoreWGSL[e.name]=e.shader);var v={name:h,shader:g};export{m as n,v as t};