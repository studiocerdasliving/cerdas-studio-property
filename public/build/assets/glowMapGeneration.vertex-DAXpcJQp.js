import{t as e}from"./rolldown-runtime-WNZMJCWm.js";import{t}from"./shaderStore-Cl2MRAbk.js";import{t as n}from"./bonesDeclaration-C7w-3jjr.js";import{n as r,t as i}from"./bakedVertexAnimation-Clm8XWzb.js";import{t as a}from"./morphTargetsVertexGlobalDeclaration-g_RmGkhf.js";import{t as o}from"./morphTargetsVertexDeclaration-v5qRbbPW.js";import{t as s}from"./morphTargetsVertexGlobal-DxKDFupI.js";import{t as c}from"./morphTargetsVertex-CeDIFAqb.js";import{t as l}from"./bonesVertex-D7Z_ZAoh.js";import{t as u}from"./clipPlaneVertex-D6yrDpJn.js";import{t as d}from"./clipPlaneVertexDeclaration-CTErOcRc.js";import{t as f}from"./instancesDeclaration-BhgUM7-J.js";import{t as p}from"./instancesVertex-CcVyDb6W.js";var m=e({glowMapGenerationVertexShader:()=>v}),h=`glowMapGenerationVertexShader`,g=`attribute vec3 position;
#include<bonesDeclaration>
#include<bakedVertexAnimationDeclaration>
#include<morphTargetsVertexGlobalDeclaration>
#include<morphTargetsVertexDeclaration>[0..maxSimultaneousMorphTargets]
#include<clipPlaneVertexDeclaration>
#include<instancesDeclaration>
uniform mat4 viewProjection;varying vec4 vPosition;
#ifdef UV1
attribute vec2 uv;
#endif
#ifdef UV2
attribute vec2 uv2;
#endif
#ifdef DIFFUSE
varying vec2 vUVDiffuse;uniform mat4 diffuseMatrix;
#endif
#ifdef OPACITY
varying vec2 vUVOpacity;uniform mat4 opacityMatrix;
#endif
#ifdef EMISSIVE
varying vec2 vUVEmissive;uniform mat4 emissiveMatrix;
#endif
#ifdef VERTEXALPHA
attribute vec4 color;varying vec4 vColor;
#endif
#define CUSTOM_VERTEX_DEFINITIONS
void main(void)
{vec3 positionUpdated=position;
#ifdef UV1
vec2 uvUpdated=uv;
#endif
#ifdef UV2
vec2 uv2Updated=uv2;
#endif
#include<morphTargetsVertexGlobal>
#include<morphTargetsVertex>[0..maxSimultaneousMorphTargets]
#include<instancesVertex>
#include<bonesVertex>
#include<bakedVertexAnimation>
vec4 worldPos=finalWorld*vec4(positionUpdated,1.0);
#ifdef CUBEMAP
vPosition=worldPos;gl_Position=viewProjection*finalWorld*vec4(position,1.0);
#else
vPosition=viewProjection*worldPos;gl_Position=vPosition;
#endif
#ifdef DIFFUSE
#ifdef DIFFUSEUV1
vUVDiffuse=vec2(diffuseMatrix*vec4(uvUpdated,1.0,0.0));
#endif
#ifdef DIFFUSEUV2
vUVDiffuse=vec2(diffuseMatrix*vec4(uv2Updated,1.0,0.0));
#endif
#endif
#ifdef OPACITY
#ifdef OPACITYUV1
vUVOpacity=vec2(opacityMatrix*vec4(uvUpdated,1.0,0.0));
#endif
#ifdef OPACITYUV2
vUVOpacity=vec2(opacityMatrix*vec4(uv2Updated,1.0,0.0));
#endif
#endif
#ifdef EMISSIVE
#ifdef EMISSIVEUV1
vUVEmissive=vec2(emissiveMatrix*vec4(uvUpdated,1.0,0.0));
#endif
#ifdef EMISSIVEUV2
vUVEmissive=vec2(emissiveMatrix*vec4(uv2Updated,1.0,0.0));
#endif
#endif
#ifdef VERTEXALPHA
vColor=color;
#endif
#include<clipPlaneVertex>
}`;t.ShadersStore[h]||(t.ShadersStore[h]=g);var _=[n,r,a,o,d,f,s,c,p,l,i,u];for(let e of _)t.IncludesShadersStore[e.name]||(t.IncludesShadersStore[e.name]=e.shader);var v={name:h,shader:g};export{m as n,v as t};