import{t as e}from"./shaderStore-Cl2MRAbk.js";var t=`fogVertex`,n=`#ifdef FOG
vFogDistance=(view*worldPos).xyz;
#endif
`;e.IncludesShadersStore[t]||(e.IncludesShadersStore[t]=n);var r={name:t,shader:n};export{r as t};