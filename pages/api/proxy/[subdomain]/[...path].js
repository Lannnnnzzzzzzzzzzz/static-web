import { getProjects } from '../projects';
import { list } from '@vercel/blob';

export async function GET(request, { params }) {
  const { subdomain, path } = params;
  
  try {
    // Cari proyek berdasarkan subdomain
    const projects = await getProjects();
    const project = projects.find(p => p.subdomain === subdomain);
    
    if (!project) {
      return new Response('Project not found', { status: 404 });
    }
    
    // Dapatkan file dari Blob
    const { blobs } = await list({ 
      prefix: `${process.env.BLOB_PREFIX || 'static-deploy'}/projects/${project.projectId}/`
    });
    
    // Cari file yang diminta
    const requestedPath = path.join('/') || 'index.html';
    const fileBlob = blobs.find(blob => {
      const blobPath = blob.pathname.split('/').slice(4).join('/');
      return blobPath === requestedPath;
    });
    
    if (!fileBlob) {
      return new Response('File not found', { status: 404 });
    }
    
    // Ambil konten file
    const response = await fetch(fileBlob.url);
    const contentType = response.headers.get('content-type') || 'text/html';
    
    return new Response(response.body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    return new Response('Internal server error', { status: 500 });
  }
}
