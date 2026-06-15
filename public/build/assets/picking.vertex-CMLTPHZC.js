import{t as e}from"./rolldown-runtime-WNZMJCWm.js";import{t}from"./shaderStore-Cl2MRAbk.js";import{t as n}from"./bonesDeclaration-C7w-3jjr.js";import{n as r,t as i}from"./bakedVertexAnimation-Clm8XWzb.js";import{t as a}from"./morphTargetsVertexGlobalDeclaration-g_RmGkhf.js";import{t as o}from"./morphTargetsVertexDeclaration-v5qRbbPW.js";import{t as s}from"./morphTargetsVertexGlobal-DxKDFupI.js";import{t as c}from"./morphTargetsVertex-CeDIFAqb.js";import{t as l}from"./bonesVertex-D7Z_ZAoh.js";import{t as u}from"./instancesDeclaration-BhgUM7-J.js";import{t as d}from"./instancesVertex-CcVyDb6W.js";var f=e({pickingVertexShader:()=>g}),p=`pickingVertexShader`,m=`attribute vec3 position;
#if defined(INSTANCES)
attribute float instanceMeshID;
#endif
#include<bonesDeclaration>
#include<bakedVertexAnimationDeclaration>
#include<morphTargetsVertexGlobalDeclaration>
#include<morphTargetsVertexDeclaration>[0..maxSimultaneousMorphTargets]
#include<instancesDeclaration>
uniform mat4 viewProjection;
#if defined(INSTANCES)
flat varying float vMeshID;
#endif
void main(void) {vec3 positionUpdated=position;
#include<morphTargetsVertexGlobal>
#include<morphTargetsVertex>[0..maxSimultaneousMorphTargets]
#include<instancesVertex>
#include<bonesVertex>
#include<bakedVertexAnimation>
vec4 worldPos=finalWorld*vec4(positionUpdated,1.0);gl_Position=viewProjection*worldPos;
#if defined(INSTANCES)
vMeshID=instanceMeshID;
#endif
}
`;t.ShadersStore[p]||(t.ShadersStore[p]=m);var h=[n,r,a,o,u,s,c,d,l,i];for(let e of h)t.IncludesShadersStore[e.name]||(t.IncludesShadersStore[e.name]=e.shader);var g={name:p,shader:m};export{f as n,g as t};