<script>
  import { onMount } from 'svelte';
  import { url } from '../lib/url.svelte.js';

  export let mode = 'private';
  export let loginPath = '/agent/login';
  export let dashboardPath = '/agent/dashboard';
  export let tokenContext = null;

  let ready = false;

  function getAgentToken() {
    const registryToken = tokenContext?.getToken?.();
    if (registryToken) return registryToken;

    return (
      localStorage.getItem('property_agent_token') ||
      sessionStorage.getItem('property_agent_token') ||
      localStorage.getItem('auth_token') ||
      sessionStorage.getItem('auth_token') ||
      localStorage.getItem('token') ||
      sessionStorage.getItem('token') ||
      localStorage.getItem('user')
    );
  }

  

  onMount(() => {
    const token = getAgentToken();

    if (mode === 'guest' && token) {
      
      window.location.replace(url(dashboardPath));
      return;
    }

    if (mode === 'private' && !token) {
      window.location.replace(url(loginPath));
      return;
    }

    
    ready = true;
  });
</script>

{#if ready}
  <slot />
{/if}
