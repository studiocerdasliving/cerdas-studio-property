<script>
    import { onMount } from "svelte";
    import Landing from "./Landing.svelte";

    onMount(() => {
        window.dispatchEvent(new CustomEvent('open-register-modal'));
        window.history.replaceState({}, '', '/');
    });
</script>

<Landing />
