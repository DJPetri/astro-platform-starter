export interface EventData {
  title: string;
  date: string;
  createdAt: string;
  storageFolder: string;
  uploadUntil: string;
  deleteAfter: string;
  fileCount?: number;
  totalSizeMB?: number;
}