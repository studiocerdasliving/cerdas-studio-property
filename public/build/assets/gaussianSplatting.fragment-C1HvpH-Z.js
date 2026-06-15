import{t as e}from"./shaderStore-Cl2MRAbk.js";import{t}from"./clipPlaneFragment-CH3aZCXN.js";import{t as n}from"./clipPlaneFragmentDeclaration-BmZ_mboQ.js";import{t as r}from"./fogFragmentDeclaration-BNau0c59.js";import{t as i}from"./logDepthFragment-GhoqkMiq.js";import{t as a}from"./fogFragment-D68TYqPH.js";import{t as o}from"./gaussianSplattingFragmentDeclaration-CBihwiGT.js";import{t as s}from"./logDepthDeclaration-CqDOU_5b.js";var c=`gaussianSplattingPixelShader`,l=`#include<clipPlaneFragmentDeclaration>
#include<logDepthDeclaration>
#include<fogFragmentDeclaration>
varying vec4 vColor;varying vec2 vPosition;
#define CUSTOM_FRAGMENT_DEFINITIONS
#include<gaussianSplattingFragmentDeclaration>
void main () {
#define CUSTOM_FRAGMENT_MAIN_BEGIN
#include<clipPlaneFragment>
vec4 finalColor=gaussianColor(vColor);
#define CUSTOM_FRAGMENT_BEFORE_FRAGCOLOR
gl_FragColor=finalColor;
#define CUSTOM_FRAGMENT_MAIN_END
}
`;e.ShadersStore[c]||(e.ShadersStore[c]=l);var u=[n,s,r,i,a,o,t];for(let t of u)e.IncludesShadersStore[t.name]||(e.IncludesShadersStore[t.name]=t.shader);var d={name:c,shader:l};export{d as gaussianSplattingPixelShader};