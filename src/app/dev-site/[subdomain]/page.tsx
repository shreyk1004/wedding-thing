// Development-only route for testing subdomain functionality locally
// Use: http://localhost:3000/dev-site/your-test-subdomain

import SitePage from '../../site/[subdomain]/page';

export default SitePage;

// Re-export the metadata generation
export { generateMetadata } from '../../site/[subdomain]/page'; 