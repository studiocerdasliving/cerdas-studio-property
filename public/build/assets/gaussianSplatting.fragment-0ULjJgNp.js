import{t as e}from"./shaderStore-Cl2MRAbk.js";import{t}from"./clipPlaneFragment-B5ejIpVP.js";import{t as n}from"./clipPlaneFragmentDeclaration-BxvG-V2U.js";import{t as r}from"./fogFragmentDeclaration-Bc2fDDwH.js";import{t as i}from"./logDepthFragment-C81THFK4.js";import{t as a}from"./fogFragment-E2nd7wnn.js";import{t as o}from"./gaussianSplattingFragmentDeclaration-E57TC3q3.js";import{t as s}from"./logDepthDeclaration-D7WB_x2I.js";var c=`gaussianSplattingPixelShader`,l=`#include<clipPlaneFragmentDeclaration>
#include<logDepthDeclaration>
#include<fogFragmentDeclaration>
varying vColor: vec4f;varying vPosition: vec2f;
#define CUSTOM_FRAGMENT_DEFINITIONS
#include<gaussianSplattingFragmentDeclaration>
@fragment
fn main(input: FragmentInputs)->FragmentOutputs {
#define CUSTOM_FRAGMENT_MAIN_BEGIN
#include<clipPlaneFragment>
var finalColor: vec4f=gaussianColor(input.vColor,input.vPosition);
#define CUSTOM_FRAGMENT_BEFORE_FRAGCOLOR
fragmentOutputs.color=finalColor;
#define CUSTOM_FRAGMENT_MAIN_END
}
`;e.ShadersStoreWGSL[c]||(e.ShadersStoreWGSL[c]=l);var u=[n,s,r,i,a,o,t];for(let t of u)e.IncludesShadersStoreWGSL[t.name]||(e.IncludesShadersStoreWGSL[t.name]=t.shader);var d={name:c,shader:l};export{d as gaussianSplattingPixelShaderWGSL};