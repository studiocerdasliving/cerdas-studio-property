import{t as e}from"./rolldown-runtime-WNZMJCWm.js";import{t}from"./shaderStore-Cl2MRAbk.js";var n=e({shadowMapFragmentSoftTransparentShadowWGSL:()=>a}),r=`shadowMapFragmentSoftTransparentShadow`,i=`#if SM_SOFTTRANSPARENTSHADOW==1
if ((bayerDither8(floor(((fragmentInputs.position.xy)%(8.0)))))/64.0>=uniforms.softTransparentShadowSM.x*alpha) {discard;}
#endif
`;t.IncludesShadersStoreWGSL[r]||(t.IncludesShadersStoreWGSL[r]=i);var a={name:r,shader:i};export{n,a as t};