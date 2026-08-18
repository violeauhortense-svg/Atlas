import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    const skillsPath = 'C:\\Users\\conta\\~\\claude-skills\\skills';
    const skillDirs = readdirSync(skillsPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    const skills = skillDirs.map(skillName => {
      return {
        name: skillName,
        path: `skills/${skillName}`,
        description: skillName.replace(/-/g, ' '),
      };
    });

    return Response.json({ skills });
  } catch (error) {
    console.error('Skills error:', error);
    return Response.json({ skills: [], error: 'Failed to load skills' }, { status: 500 });
  }
}
