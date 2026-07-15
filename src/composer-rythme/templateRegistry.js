import Layout from '../components/Layout.svelte';
import AgentLayout from '../components/AgentLayout.svelte';
import { BlankShell } from '@cerdas/shell';

export const templateRegistry = {
  public: { name: 'public', component: Layout, ownsShell: true },
  agent: { name: 'agent', component: AgentLayout, ownsShell: true },
  blank: { name: 'blank', component: BlankShell, ownsShell: true },
};

export function getTemplateContext(name = 'public') {
  return templateRegistry[name] || templateRegistry.public;
}
