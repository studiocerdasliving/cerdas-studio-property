import{t as e}from"./rolldown-runtime-WNZMJCWm.js";import{t}from"./shaderStore-Cl2MRAbk.js";import{t as n}from"./clipPlaneFragment-B5ejIpVP.js";import{t as r}from"./clipPlaneFragmentDeclaration-BxvG-V2U.js";import{t as i}from"./logDepthFragment-C81THFK4.js";import{t as a}from"./logDepthDeclaration-D7WB_x2I.js";var o=e({linePixelShaderWGSL:()=>u}),s=`linePixelShader`,c=`#include<clipPlaneFragmentDeclaration>
uniform color: vec4f;
#include<logDepthDeclaration>
#define CUSTOM_FRAGMENT_DEFINITIONS
@fragment
fn main(input: FragmentInputs)->FragmentOutputs {
#define CUSTOM_FRAGMENT_MAIN_BEGIN
#include<logDepthFragment>
#include<clipPlaneFragment>
fragmentOutputs.color=uniforms.color;
#define CUSTOM_FRAGMENT_MAIN_END
}`;t.ShadersStoreWGSL[s]||(t.ShadersStoreWGSL[s]=c);var l=[r,a,i,n];for(let e of l)t.IncludesShadersStoreWGSL[e.name]||(t.IncludesShadersStoreWGSL[e.name]=e.shader);var u={name:s,shader:c};export{o as n,u as t};