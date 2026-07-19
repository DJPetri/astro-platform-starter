export interface EventData {
  title: string;
  date: string;
  eventVariant?: "wedding" | "neutral";
  createdAt: string;
  storageFolder: string;
  uploadUntil: string;
  deleteAfter: string;
  fileCount?: number;
  totalSizeMB?: number;
}
