import Dexie, { Table } from 'dexie';
import { ExtractedData } from './gemini-ai-service';

export interface DocumentSubmission {
  id?: number;
  cardNumber: string;
  documentType: string;
  department: string;
  images: string[];
  originalImageCount: number;
  timestamp: string;
  citizenId: string;
  status: string;
  aiExtractedData?: ExtractedData[];
  aiProcessingTime?: number;
}

export interface DepartmentApproval {
    id?: number;
    approvalId: string;
    cardNumber: string;
    documentType: string;
    department: string;
    citizenId: string;
    status: string;
    timestamp: string;
    officialAction: string;
    images: string[];
    feedback: any;
}

class AppDatabase extends Dexie {
  public documents!: Table<DocumentSubmission, number>;
  public approvals!: Table<DepartmentApproval, number>;

  public constructor() {
    super('AppDatabase');
    this.version(1).stores({
      documents: '++id, cardNumber, department, timestamp',
      approvals: '++id, approvalId, cardNumber, department, timestamp',
    });
  }
}

export const db = new AppDatabase();
