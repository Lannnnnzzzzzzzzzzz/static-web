import { readJsonFile, writeJsonFile } from '../../lib/blob';

const PROJECTS_FILE = `${process.env.BLOB_PREFIX || 'static-deploy'}/projects/projects.json`;

export async function getProjects() {
  const projects = await readJsonFile(PROJECTS_FILE);
  return projects || [];
}

export async function createProject(data) {
  const projects = await getProjects();
  const project = {
    id: Date.now().toString(),
    ...data,
    createdAt: new Date().toISOString(),
  };
  projects.push(project);
  await writeJsonFile(PROJECTS_FILE, projects);
  return project;
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const projects = await getProjects();
      return res.status(200).json(projects);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
