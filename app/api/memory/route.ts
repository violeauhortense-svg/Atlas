import { readFileSync } from 'fs';

export async function GET() {
  try {
    const memoryPath = 'C:\\Users\\conta\\.claude-mem\\settings.json';
    const settingsData = readFileSync(memoryPath, 'utf-8');
    const settings = JSON.parse(settingsData);

    return Response.json({
      memory: {
        configured: true,
        memoryPath: 'C:\\Users\\conta\\.claude-mem',
        settings: settings
      }
    });
  } catch (error) {
    console.error('Memory error:', error);
    return Response.json({
      memory: { configured: false },
      error: 'Failed to load memory'
    }, { status: 500 });
  }
}
