import {RecordStatus} from "../enums";

export type User = {
  id: number;
  name: string;
  records: Record[]
}

export type Record = {
  item_id?: number;
  lockVersion?: number;
  id: string;
  title: string;
  description?: string;
  caption?: string;
  status: RecordStatus
  color?: string;
  createdAt?: string;
  estimated_time?: number;
  hours?: number;
  start_date?: string
  end_date?: string
  changedDate: string
};

export type Column = {
  id: string;
  title: string;
  description?: string;
  caption?: string;
  status: RecordStatus
  color?: string;
  records?: Record[];
  wipLimit?: number;
  wipEnabled?: boolean;
  createdAt?: string;
};
