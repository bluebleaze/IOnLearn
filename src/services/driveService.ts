export class DriveService {
  public static async getFileContent(token: string, fileId: string, mimeType: string): Promise<string | null> {
    try {
      // If it's a Google Doc, export it as plain text
      if (mimeType === 'application/vnd.google-apps.document') {
        const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          return await res.text();
        }
      } 
      // If it's a Google Presentation, export as plain text
      else if (mimeType === 'application/vnd.google-apps.presentation') {
        const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/plain`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          return await res.text();
        }
      }
      // If it's a plain text file
      else if (mimeType === 'text/plain') {
         const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          return await res.text();
        }
      }
      // Note: PDFs are harder to parse directly in client without a library like pdf.js. 
      // For now, we will just say we cannot read PDF directly unless we use an API or library.
      
      return null;
    } catch (e) {
      console.error('Error fetching drive file content:', e);
      return null;
    }
  }

  public static async getFileMetadata(token: string, fileId: string): Promise<any> {
    try {
      const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch(e) {
      console.error('Error fetching drive metadata:', e);
      return null;
    }
  }
}
