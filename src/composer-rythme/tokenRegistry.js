export const tokenRegistry = {
  propertyAgent: {
    name: 'propertyAgent',
    tokenKeys: ['property_agent_token', 'auth_token', 'token'],
    loginPath: '/agent/login',
    dashboardPath: '/agent/dashboard',
    getToken() {
      return this.tokenKeys.map((key) => localStorage.getItem(key)).find(Boolean) || null;
    },
  },
};

export function getTokenContext(name = 'propertyAgent') {
  return tokenRegistry[name] || tokenRegistry.propertyAgent;
}
