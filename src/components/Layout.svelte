<script>
  import { PublicShell } from '@cerdas/shell';

  let {
      children,
      title = 'Cerdas Living',
      description = 'Portal Properti & Lifestyle Premium Indonesia',
      keywords = '',
      ogImage = '',
      ogType = 'website',
  } = $props();
</script>

<svelte:head>
  {#if keywords}
    <meta name="keywords" content={keywords} />
  {/if}
  {#if ogImage}
    <meta property="og:image" content={ogImage} />
  {/if}
  <meta property="og:type" content={ogType} />
</svelte:head>

<PublicShell activeApp="property" {title} {description}>
  {@render children()}
</PublicShell>
