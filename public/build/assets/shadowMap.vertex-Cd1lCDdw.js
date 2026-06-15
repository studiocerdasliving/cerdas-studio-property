import{t as e}from"./rolldown-runtime-WNZMJCWm.js";import{t}from"./shaderStore-Cl2MRAbk.js";import{t as n}from"./bonesDeclaration-C7w-3jjr.js";import{n as r,t as i}from"./bakedVertexAnimation-Clm8XWzb.js";import{t as a}from"./morphTargetsVertexGlobalDeclaration-g_RmGkhf.js";import{t as o}from"./morphTargetsVertexDeclaration-v5qRbbPW.js";import{t as s}from"./morphTargetsVertexGlobal-DxKDFupI.js";import{t as c}from"./morphTargetsVertex-CeDIFAqb.js";import{t as l}from"./bonesVertex-D7Z_ZAoh.js";import{t as u}from"./clipPlaneVertex-D6yrDpJn.js";import{t as d}from"./clipPlaneVertexDeclaration-CTErOcRc.js";import{t as f}from"./helperFunctions-XZzpehR-.js";import{t as p}from"./shadowMapVertexMetric-BZk7SvGU.js";import{t as m}from"./sceneUboDeclaration-CwKQCQSn.js";import{t as h}from"./instancesVertex-CcVyDb6W.js";import{t as g}from"./meshUboDeclaration-CXAB_v_o.js";import{t as _}from"./sceneVertexDeclaration-CKIsPZ8L.js";import{t as v}from"./meshVertexDeclaration-DiqXu9Db.js";var y=`shadowMapVertexDeclaration`,b=`#include<sceneVertexDeclaration>
#include<meshVertexDeclaration>
`;t.IncludesShadersStore[y]||(t.IncludesShadersStore[y]=b);var x={name:y,shader:b},S=`shadowMapUboDeclaration`,C=`layout(std140,column_major) uniform;
#include<sceneUboDeclaration>
#include<meshUboDeclaration>
`;t.IncludesShadersStore[S]||(t.IncludesShadersStore[S]=C);var w={name:S,shader:C},T=`shadowMapVertexExtraDeclaration`,E=`#if SM_NORMALBIAS==1
uniform vec3 lightDataSM;
#endif
uniform vec3 biasAndScaleSM;uniform vec2 depthValuesSM;varying float vDepthMetricSM;
#if SM_USEDISTANCE==1
varying vec3 vPositionWSM;
#endif
#if defined(SM_DEPTHCLAMP) && SM_DEPTHCLAMP==1
varying float zSM;
#endif
`;t.IncludesShadersStore[T]||(t.IncludesShadersStore[T]=E);var D={name:T,shader:E},O=`shadowMapVertexNormalBias`,k=`#if SM_NORMALBIAS==1
#if SM_DIRECTIONINLIGHTDATA==1
vec3 worldLightDirSM=normalize(-lightDataSM.xyz);
#else
vec3 directionToLightSM=lightDataSM.xyz-worldPos.xyz;vec3 worldLightDirSM=normalize(directionToLightSM);
#endif
float ndlSM=dot(vNormalW,worldLightDirSM);float sinNLSM=sqrt(1.0-ndlSM*ndlSM);float normalBiasSM=biasAndScaleSM.y*sinNLSM;worldPos.xyz-=vNormalW*normalBiasSM;
#endif
`;t.IncludesShadersStore[O]||(t.IncludesShadersStore[O]=k);var A={name:O,shader:k},j=e({shadowMapVertexShader:()=>F}),M=`shadowMapVertexShader`,N=`attribute vec3 position;
#ifdef NORMAL
attribute vec3 normal;
#endif
#include<bonesDeclaration>
#include<bakedVertexAnimationDeclaration>
#include<morphTargetsVertexGlobalDeclaration>
#include<morphTargetsVertexDeclaration>[0..maxSimultaneousMorphTargets]
#ifdef INSTANCES
attribute vec4 world0;attribute vec4 world1;attribute vec4 world2;attribute vec4 world3;
#endif
#include<helperFunctions>
#include<__decl__shadowMapVertex>
#ifdef ALPHATEXTURE
varying vec2 vUV;uniform mat4 diffuseMatrix;
#ifdef UV1
attribute vec2 uv;
#endif
#ifdef UV2
attribute vec2 uv2;
#endif
#endif
#include<shadowMapVertexExtraDeclaration>
#include<clipPlaneVertexDeclaration>
#define CUSTOM_VERTEX_DEFINITIONS
void main(void)
{vec3 positionUpdated=position;
#ifdef UV1
vec2 uvUpdated=uv;
#endif
#ifdef UV2
vec2 uv2Updated=uv2;
#endif
#ifdef NORMAL
vec3 normalUpdated=normal;
#endif
#include<morphTargetsVertexGlobal>
#include<morphTargetsVertex>[0..maxSimultaneousMorphTargets]
#include<instancesVertex>
#include<bonesVertex>
#include<bakedVertexAnimation>
vec4 worldPos=finalWorld*vec4(positionUpdated,1.0);
#ifdef NORMAL
mat3 normWorldSM=mat3(finalWorld);
#if defined(INSTANCES) && defined(THIN_INSTANCES)
vec3 vNormalW=normalUpdated/vec3(dot(normWorldSM[0],normWorldSM[0]),dot(normWorldSM[1],normWorldSM[1]),dot(normWorldSM[2],normWorldSM[2]));vNormalW=normalize(normWorldSM*vNormalW);
#else
#ifdef NONUNIFORMSCALING
normWorldSM=transposeMat3(inverseMat3(normWorldSM));
#endif
vec3 vNormalW=normalize(normWorldSM*normalUpdated);
#endif
#endif
#include<shadowMapVertexNormalBias>
gl_Position=viewProjection*worldPos;
#include<shadowMapVertexMetric>
#ifdef ALPHATEXTURE
#ifdef UV1
vUV=vec2(diffuseMatrix*vec4(uvUpdated,1.0,0.0));
#endif
#ifdef UV2
vUV=vec2(diffuseMatrix*vec4(uv2Updated,1.0,0.0));
#endif
#endif
#include<clipPlaneVertex>
}`;t.ShadersStore[M]||(t.ShadersStore[M]=N);var P=[n,r,a,o,f,_,v,x,m,g,w,D,d,s,c,h,l,i,A,p,u];for(let e of P)t.IncludesShadersStore[e.name]||(t.IncludesShadersStore[e.name]=e.shader);var F={name:M,shader:N};export{j as n,F as t};