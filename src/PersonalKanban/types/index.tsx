import {RecordStatus} from "../enums";

export type User = {
  id: number;
  name: string;
  records: Record[]
}

export type Record = {
  id: string;
  title: string;
  description?: string;
  caption?: string;
  status: RecordStatus
  color?: string;
  createdAt?: string;
};

export type Column = {
  id: string;
  title: string;
  description?: string;
  caption?: string;
  color?: string;
  records?: Record[];
  wipLimit?: number;
  wipEnabled?: boolean;
  createdAt?: string;
};
