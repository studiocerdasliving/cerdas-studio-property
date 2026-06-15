import{t as e}from"./shaderStore-Cl2MRAbk.js";import"./sceneUboDeclaration-CwKQCQSn.js";import"./meshUboDeclaration-CXAB_v_o.js";var t=`gaussianSplattingUboDeclaration`,n=`#include<sceneUboDeclaration>
#include<meshUboDeclaration>
attribute vec3 position;attribute vec4 splatIndex0;attribute vec4 splatIndex1;attribute vec4 splatIndex2;attribute vec4 splatIndex3;
`;e.IncludesShadersStore[t]||(e.IncludesShadersStore[t]=n);var r={name:t,shader:n};export{r as t};