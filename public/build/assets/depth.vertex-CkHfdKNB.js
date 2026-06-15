import{t as e}from"./rolldown-runtime-WNZMJCWm.js";import{t}from"./shaderStore-Cl2MRAbk.js";import{t as n}from"./bonesDeclaration-C7w-3jjr.js";import{n as r,t as i}from"./bakedVertexAnimation-Clm8XWzb.js";import{t as a}from"./morphTargetsVertexGlobalDeclaration-g_RmGkhf.js";import{t as o}from"./morphTargetsVertexDeclaration-v5qRbbPW.js";import{t as s}from"./morphTargetsVertexGlobal-DxKDFupI.js";import{t as c}from"./morphTargetsVertex-CeDIFAqb.js";import{t as l}from"./bonesVertex-D7Z_ZAoh.js";import{t as u}from"./clipPlaneVertex-D6yrDpJn.js";import{t as d}from"./clipPlaneVertexDeclaration-CTErOcRc.js";import{t as f}from"./instancesDeclaration-BhgUM7-J.js";import{t as p}from"./instancesVertex-CcVyDb6W.js";import{t as m}from"./pointCloudVertex-D1Fl0I3d.js";var h=`pointCloudVertexDeclaration`,g=`#ifdef POINTSIZE
uniform float pointSize;
#endif
`;t.IncludesShadersStore[h]||(t.IncludesShadersStore[h]=g);var _={name:h,shader:g},v=e({depthVertexShader:()=>S}),y=`depthVertexShader`,b=`attribute vec3 position;
#include<bonesDeclaration>
#include<bakedVertexAnimationDeclaration>
#include<morphTargetsVertexGlobalDeclaration>
#include<morphTargetsVertexDeclaration>[0..maxSimultaneousMorphTargets]
#include<clipPlaneVertexDeclaration>
#include<instancesDeclaration>
uniform mat4 viewProjection;uniform vec2 depthValues;
#if defined(ALPHATEST) || defined(NEED_UV)
varying vec2 vUV;uniform mat4 diffuseMatrix;
#ifdef UV1
attribute vec2 uv;
#endif
#ifdef UV2
attribute vec2 uv2;
#endif
#endif
#ifdef STORE_CAMERASPACE_Z
uniform mat4 view;varying vec4 vViewPos;
#endif
#include<pointCloudVertexDeclaration>
varying float vDepthMetric;
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
#include<clipPlaneVertex>
gl_Position=viewProjection*worldPos;
#ifdef STORE_CAMERASPACE_Z
vViewPos=view*worldPos;
#else
#ifdef USE_REVERSE_DEPTHBUFFER
vDepthMetric=((-gl_Position.z+depthValues.x)/(depthValues.y));
#else
vDepthMetric=((gl_Position.z+depthValues.x)/(depthValues.y));
#endif
#endif
#if defined(ALPHATEST) || defined(BASIC_RENDER)
#ifdef UV1
vUV=vec2(diffuseMatrix*vec4(uvUpdated,1.0,0.0));
#endif
#ifdef UV2
vUV=vec2(diffuseMatrix*vec4(uv2Updated,1.0,0.0));
#endif
#endif
#include<pointCloudVertex>
}
`;t.ShadersStore[y]||(t.ShadersStore[y]=b);var x=[n,r,a,o,d,f,_,s,c,p,l,i,u,m];for(let e of x)t.IncludesShadersStore[e.name]||(t.IncludesShadersStore[e.name]=e.shader);var S={name:y,shader:b};export{v as n,S as t};