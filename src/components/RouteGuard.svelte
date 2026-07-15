<script>
  import { onMount } from 'svelte';
  import { url } from '../lib/url.svelte.js';

  export let mode = 'private';
  export let loginPath = '/agent/login';
  export let dashboardPath = '/agent/dashboard';

  let ready = false;

  function getAgentToken() {
    return (
      localStorage.getItem("user") ||
      localStorage.getItem("user") ||
      localStorage.getItem("user")
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
