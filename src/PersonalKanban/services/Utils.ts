import {v4 as uuidv4} from "uuid";
import moment from "moment";

import {Column, Record} from "PersonalKanban/types";
import {RecordStatus} from "../enums";

export const getId = (): string => {
  return uuidv4();
};

export const reorder = (list: any[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

export const getCreatedAt = () => {
  return `${moment().format("DD.MM.YYYY")} ${moment().format("HH:mm:ss")}`;
};

export const reorderCards = ({
  columns,
  sourceColumn,
  destinationColumn,
  sourceIndex,
  destinationIndex,
}: {
  columns: Column[];
  sourceColumn: Column;
  destinationColumn: Column;
  sourceIndex: number;
  destinationIndex: number;
}) => {
  const getColumnIndex = (columnId: string) =>
    columns.findIndex((c) => c.id === columnId);

  const getRecords = (columnId: string) => [
    ...columns.find((c) => c.id === columnId)?.records!,
  ];

  const current = getRecords(sourceColumn.id);
  const next = getRecords(destinationColumn.id);
  const target = current[sourceIndex];

  // moving to same list
  if (sourceColumn.id === destinationColumn.id) {
    const reordered = reorder(current, sourceIndex, destinationIndex);
    const newColumns = columns.map((c) => ({ ...c }));
    newColumns[getColumnIndex(sourceColumn.id)].records = reordered;
    return newColumns;
  }

  // moving to different list
  current.splice(sourceIndex, 1);
  next.splice(destinationIndex, 0, target);
  const newColumns = columns.map((c) => ({ ...c }));
  newColumns[getColumnIndex(sourceColumn.id)].records = current;
  newColumns[getColumnIndex(destinationColumn.id)].records = next;
  return newColumns;
};
export const insertToPositionArr = (arr: any[], data: any, position: number)  => {
  if (position >= arr.length) {
    arr.push(data) // Put at the end if position is more than total length of array
  } else if (position <= 0) {
    arr.unshift(data) // Put at the start if position is less than or equal to 0
  } else { // Shift all elements to right
    for (let i = arr.length; i >= position; i--) {
      arr[i] = arr[i - 1];
    }
    arr[position] = data;
  }
}
export const getInitialState = (contentCard: Record[]) => {
  // содежимое блока формируем из приходящего значения
  console.log(contentCard)
  const filterCardsByStatus = (status: RecordStatus) => {
    return contentCard.filter(item => item.status === status)
  }

  return [
    {
      id: getId(),
      title: "В плане",
      color: "Orange",
      status: RecordStatus.Plan,
      records: filterCardsByStatus(RecordStatus.Plan),
      createdAt: getCreatedAt(),
    },
    {
      id: getId(),
      title: "В работе",
      color: "Blue",
      status: RecordStatus.Progress,
      records: filterCardsByStatus(RecordStatus.Progress),
      createdAt: getCreatedAt(),
    },
    {

      id: getId(),
      title: "На проверке",
      color: "Purple",
      status: RecordStatus.Inspection,
      records: filterCardsByStatus(RecordStatus.Inspection),
      createdAt: getCreatedAt(),  
    },
  ];
};





