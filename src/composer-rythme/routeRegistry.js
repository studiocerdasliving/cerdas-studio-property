import Login from '../pages/Auth/Login.svelte';
import Register from '../pages/Auth/RegisterAgent.svelte';
import Landing from '../pages/Landing.svelte';
import AiAssistant from '../pages/AiAssistant.svelte';
import PropertyIndex from '../pages/Property/Index.svelte';
import PropertyShow from '../pages/Property/Show.svelte';
import AgentProfil from '../pages/Agent/Profil.svelte';
import AgentDashboard from '../pages/Agent/Dashboard/Index.svelte';
import AgentIklanIndex from '../pages/Agent/Iklan/Index.svelte';
import AgentIklanCreate from '../pages/Agent/Iklan/Create.svelte';
import AgentIklanEdit from '../pages/Agent/Iklan/Edit.svelte';
import AgentBeliPaket from '../pages/Agent/BeliPaket.svelte';
import BeritaShow from '../pages/Berita/Show.svelte';
import TestimoniIndex from '../pages/Testimoni/Index.svelte';
import TestimoniCreate from '../pages/Testimoni/Create.svelte';
import Kontak from '../pages/Kontak.svelte';
import Tentang from '../pages/Tentang.svelte';
import Privasi from '../pages/Privasi.svelte';
import Syarat from '../pages/Syarat.svelte';
import KprCalculator from '../pages/KprCalculator.svelte';
import Gallery from '../pages/Gallery.svelte';
import Viewer from '../pages/Viewer.svelte';

export const routes = {
  '/': { mode: 'guest', template: 'public', token: 'propertyAgent', view: Landing },
  '/properti': { mode: 'guest', template: 'public', token: 'propertyAgent', view: PropertyIndex },
  '/properti/:slug': { mode: 'guest', template: 'public', token: 'propertyAgent', view: PropertyShow },
  '/ai/assistant': { mode: 'guest', template: 'public', token: 'propertyAgent', view: AiAssistant },
  '/berita/:slug': { mode: 'guest', template: 'public', token: 'propertyAgent', view: BeritaShow },
  '/testimoni': { mode: 'guest', template: 'public', token: 'propertyAgent', view: TestimoniIndex },
  '/testimoni/kirim': { mode: 'guest', template: 'public', token: 'propertyAgent', view: TestimoniCreate },
  '/kpr-calculator': { mode: 'guest', template: 'blank', token: 'propertyAgent', view: KprCalculator },
  '/gallery': { mode: 'guest', template: 'public', token: 'propertyAgent', view: Gallery },
  '/viewer': { mode: 'guest', template: 'blank', token: 'propertyAgent', view: Viewer },
  '/kontak': { mode: 'guest', template: 'public', token: 'propertyAgent', view: Kontak },
  '/tentang': { mode: 'guest', template: 'public', token: 'propertyAgent', view: Tentang },
  '/privasi': { mode: 'guest', template: 'public', token: 'propertyAgent', view: Privasi },
  '/syarat': { mode: 'guest', template: 'public', token: 'propertyAgent', view: Syarat },
  '/agent/login': { mode: 'guest', template: 'public', token: 'propertyAgent', view: Login },
  '/login': { mode: 'guest', template: 'public', token: 'propertyAgent', view: Login },
  '/register': { mode: 'guest', template: 'public', token: 'propertyAgent', view: Register },
  '/agent/register': { mode: 'guest', template: 'public', token: 'propertyAgent', view: Register },
  '/pasang-iklan': { mode: 'guest', template: 'public', token: 'propertyAgent', view: Register },
  '/agent/dashboard': { mode: 'private', template: 'agent', token: 'propertyAgent', view: AgentDashboard },
  '/agent/beli-paket-iklan': { mode: 'private', template: 'agent', token: 'propertyAgent', view: AgentBeliPaket },
  '/agent/profil': { mode: 'private', template: 'agent', token: 'propertyAgent', view: AgentProfil },
  '/agent/iklan': { mode: 'private', template: 'agent', token: 'propertyAgent', view: AgentIklanIndex },
  '/agent/iklan/tambah': { mode: 'private', template: 'agent', token: 'propertyAgent', view: AgentIklanCreate },
  '/agent/iklan/:id/edit': { mode: 'private', template: 'agent', token: 'propertyAgent', view: AgentIklanEdit },
};

export function getRouteConfig(routeKey) {
  return routes[routeKey] || routes['/'];
}
