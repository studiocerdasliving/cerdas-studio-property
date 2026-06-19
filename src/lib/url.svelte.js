export function url(path) {
  if (path && (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//'))) {
    return path;
  }
  let base = ''; // You can configure a base URL if deploying to a subdirectory
  
  if (!path || path === '/') return base || '/'
  return base + path
}

export function propertyImg(filename) {
  if (!filename || filename === 'null') return 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80'
  let base = '';
  
  // Clean up any double slashes just in case
  const path = `/upload/property/${filename}`;
  return (base + path).replace(/([^:])\/\//g, '$1/');
}
