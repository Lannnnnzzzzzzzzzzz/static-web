import { NextResponse } from 'next/server';
import { createProject } from './projects';
import { uploadFile } from '../../lib/blob';
import AdmZip from 'adm-zip';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const name = formData.get('name');
    const customDomain = formData.get('customDomain') || null;

    if (!file || !name) {
      return NextResponse.json({ error: 'Missing file or project name' }, { status: 400 });
    }

    // Generate subdomain unik
    const subdomain = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`;
    const projectId = Date.now().toString();
    
    // Ekstrak ZIP file
    const zip = new AdmZip(Buffer.from(await file.arrayBuffer()));
    const zipEntries = zip.getEntries();
    
    // Upload setiap file ke Blob
    const uploadedFiles = [];
    for (const entry of zipEntries) {
      if (!entry.isDirectory) {
        const fileName = entry.entryName;
        const fileData = entry.getData();
        
        const blob = new Blob([fileData]);
        const fileObj = new File([blob], fileName, { type: 'application/octet-stream' });
        
        const path = `${process.env.BLOB_PREFIX || 'static-deploy'}/projects/${projectId}/${fileName}`;
        const uploadedFile = await uploadFile(path, fileObj);
        uploadedFiles.push({
          path: fileName,
          url: uploadedFile.url,
        });
      }
    }
    
    // Simpan metadata proyek
    const project = await createProject({
      name,
      subdomain,
      customDomain,
      projectId,
      files: uploadedFiles,
      status: 'success',
    });

    return NextResponse.json({
      success: true,
      url: customDomain || `${subdomain}.itsmeelann.web.id`,
      project,
    });
  } catch (error) {
    console.error('Deploy error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
