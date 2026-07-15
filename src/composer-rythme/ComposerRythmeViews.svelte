<script>
  import { onMount } from 'svelte';
  import RouteGuard from '../components/RouteGuard.svelte';
  import { getRouteConfig } from './routeRegistry.js';
  import { getAction } from './actionRegistry.js';
  import { getTemplateContext } from './templateRegistry.js';
  import { getTokenContext } from './tokenRegistry.js';

  export let routeKey = '/';
  export let params = {};

  let ready = false;
  let state = {};
  let actions = {};
  let error = null;

  $: routeConfig = getRouteConfig(routeKey);
  $: View = routeConfig?.view;
  $: templateContext = getTemplateContext(routeConfig?.template);
  $: tokenContext = getTokenContext(routeConfig?.token);
  $: viewProps = {
    ...params,
    state,
    actions,
    error,
    routeConfig,
    templateContext,
    tokenContext,
  };

  onMount(async () => {
    ready = false;
    error = null;

    try {
      const action = getAction(routeConfig?.action);
      if (action) {
        const result = await action({ params, routeConfig, tokenContext, templateContext });
        state = result?.state || {};
        actions = result?.actions || {};
      }
    } catch (err) {
      error = err;
    } finally {
      ready = true;
    }
  });
</script>

{#if routeConfig && View}
  <RouteGuard
    mode={routeConfig.mode}
    loginPath={tokenContext.loginPath}
    dashboardPath={tokenContext.dashboardPath}
    {tokenContext}
  >
    {#if ready}
      <svelte:component this={View} {...viewProps} />
    {/if}
  </RouteGuard>
{/if}
