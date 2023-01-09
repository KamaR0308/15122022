// Пожалуйста, оптимизируйте код. Читать и масштабировать очень сложно. Как минимум, вам нужно разбить компоненты на подкомпоненты. Вдобавок - желательно комментировать код, как делаю я.

import React from "react";

import Box from "@material-ui/core/Box";
import {makeStyles} from "@material-ui/core/styles";

import KanbanBoard from "PersonalKanban/components/KanbanBoard";
import {Column, Record, User} from "PersonalKanban/types";
import {
    getCreatedAt,
    getId,
    getInitialState,
    insertToPositionArr,
    reorder,
    reorderCards,
} from "PersonalKanban/services/Utils";
import StorageService, {getItem, setItem} from "PersonalKanban/services/StorageService";
import Toolbar from "PersonalKanban/containers/Toolbar";
import {RecordStatus} from "../../enums";

const useKanbanBoardStyles = makeStyles((theme) => ({
    toolbar: theme.mixins.toolbar,
}));

type KanbanBoardContainerProps = {};

export interface IRecordContext {
    handleRecordHours: (idRecord: string, hours: number) => void
}

export const RecordContext = React.createContext<IRecordContext>({
    handleRecordHours(idRecord: string, hours: number): void {}
})
const KanbanBoardContainer: React.FC<KanbanBoardContainerProps> = (props) => {
    let initialState = StorageService.getColumns();

    const [usersState, setUsers] = React.useState<User[]>(getItem('user_data') || [])
    const [choosedUserId, setChoosedUserId] = React.useState<number>(1)

    const [contentCardKanban, setContentCardKanban] = React.useState<Record[]>([]);

    if (!initialState) {
        initialState = getInitialState(contentCardKanban);
    }

    React.useEffect(() => {
        // когда state поменялся, меняем содержимое карточек и получаем уже обновлённое
        initialState = getInitialState(contentCardKanban);

        // и обновляем сами карточки
        setColumns(initialState);
    }, [contentCardKanban]);

    const [columns, setColumns] = React.useState<Column[]>(initialState);

    const classes = useKanbanBoardStyles();
    React.useEffect(() => {

        setItem('user_data', usersState)

    }, [columns])
    const cloneColumns = React.useCallback((columns: Column[]) => {
        return columns.map((column: Column) => ({
            ...column,
            records: [...column.records!],
        }));
    }, []);

    const getColumnIndex = React.useCallback(
        (id: string) => {
            return columns.findIndex((c: Column) => c.id === id);
        },
        [columns]
    );

    const getRecordIndex = React.useCallback(
        (recordId: string, columnId: string) => {
            return columns[getColumnIndex(columnId)]?.records?.findIndex(
                (r: Record) => r.id === recordId
            );
        },
        [columns, getColumnIndex]
    );

    const handleClearBoard = React.useCallback(() => {
        setColumns([]);
    }, []);

    const handleAddColumn = React.useCallback(
        ({column}: { column: Column }) => {
            setColumns((columns: Column[]) => [
                ...columns,
                Object.assign(
                    {id: getId(), records: [], createdAt: getCreatedAt()},
                    column
                ),
            ]);
        },
        []
    );

    const handleColumnMove = React.useCallback(
        ({column, index}: { column: Column; index: number }) => {
            const updatedColumns = reorder(columns, getColumnIndex(column.id), index);
            setColumns(updatedColumns);
        },

        [columns, getColumnIndex]
    );

    const handleColumnEdit = React.useCallback(
        ({column}: { column: Column }) => {
            setColumns((_columns: Column[]) => {
                const columnIndex = getColumnIndex(column.id);
                const columns = cloneColumns(_columns);
                columns[columnIndex].title = column.title;
                columns[columnIndex].description = column.description;
                columns[columnIndex].color = column.color;
                columns[columnIndex].wipEnabled = column.wipEnabled;
                columns[columnIndex].wipLimit = column.wipLimit;
                return columns;
            });

        },

        [getColumnIndex, cloneColumns]
    );

    const handleColumnDelete = React.useCallback(
        ({column}: { column: Column }) => {
            setColumns((_columns: Column[]) => {
                const columns = cloneColumns(_columns);
                columns.splice(getColumnIndex(column.id), 1);
                return columns;
            });
        },
        [cloneColumns, getColumnIndex]
    );

    const handleCardMove = React.useCallback(
        ({
             column,
             index,
             source,
             record,
         }: {
            column: Column;
            index: number;
            source: Column;
            record: Record;
        }) => {
            const changedDT: string = new Date().toLocaleString().split(',').join("")
            record.changedDate = changedDT
            const updatedColumns = reorderCards({
                columns,
                destinationColumn: column,
                destinationIndex: index,
                sourceColumn: source,
                sourceIndex: getRecordIndex(record.id, source.id)!,
            });
            setColumns(updatedColumns);

            const bufferUsers: User[] = usersState
            const chosenUser: User = usersState[choosedUserId - 1]
            let bufferRecords: Record[] = []

            //alert(index)

            chosenUser.records.forEach((value) => {
                if (value.id === record.id) {
                    bufferRecords = chosenUser.records.filter(item => item.id !== record.id)
                    bufferRecords.push({
                        ...record,
                        status: column.status,
                        changedDate: changedDT
                    })
                }

            })

            //console.log(bufferRecords)
            //console.log(column)
            chosenUser.records = bufferRecords
            bufferUsers[choosedUserId - 1] = chosenUser
            //console.log(bufferUsers)
            // alert('sas-2')
            setUsers([...bufferUsers])
            //alert('s')
        },

        [columns, getRecordIndex, usersState, props]
    );
    React.useEffect(() => {

    }, [usersState])
    const handleRecordHours = React.useCallback((idRecord: string, hours: number) => {
        const cloneUsersState = usersState
        const indexRecord = cloneUsersState[choosedUserId - 1].records.findIndex(item => item.id === idRecord)
        cloneUsersState[choosedUserId - 1].records[indexRecord].hours = hours
        setUsers([...cloneUsersState])
        setItem('user_data', cloneUsersState)

    }, [choosedUserId])
    const handleAddRecord = React.useCallback(
        ({column, record}: { column: Column; record: Record }) => {
            const columnIndex = getColumnIndex(column.id);
            setColumns((_columns: Column[]) => {
                const columns = cloneColumns(_columns);

                columns[columnIndex].records = [
                    {
                        id: getId(),
                        title: record.title,
                        description: record.description,
                        color: record.color,
                        hours: 0,
                        status: record.status,
                        createdAt: getCreatedAt(),
                        changedDate: new Date().toLocaleDateString().split(',').join('')
                    },
                    ...columns[columnIndex].records,
                ];
                return columns;
            });

        },

        [cloneColumns, getColumnIndex]
    );

    const handleRecordEdit = React.useCallback(
        ({column, record}: { column: Column; record: Record }) => {
            const columnIndex = getColumnIndex(column.id);
            const recordIndex = getRecordIndex(record.id, column.id);
            setColumns((_columns) => {
                const columns = cloneColumns(_columns);
                const _record = columns[columnIndex].records[recordIndex!];
                _record.title = record.title;
                _record.description = record.description;
                _record.color = record.color;
                return columns;
            });

        },

        [getColumnIndex, getRecordIndex, cloneColumns]
    );

    const handleRecordDelete = React.useCallback(
        ({column, record}: { column: Column; record: Record }) => {
            const columnIndex = getColumnIndex(column.id);
            const recordIndex = getRecordIndex(record.id, column.id);
            setColumns((_columns) => {
                const columns = cloneColumns(_columns);
                columns[columnIndex].records.splice(recordIndex!, 1);
                return columns;
            });
        },
        [cloneColumns, getColumnIndex, getRecordIndex]
    );

    const handleAllRecordDelete = React.useCallback(
        ({column}: { column: Column }) => {
            const columnIndex = getColumnIndex(column.id);
            setColumns((_columns) => {
                const columns = cloneColumns(_columns);
                columns[columnIndex].records = [];
                return columns;
            });
        },
        [cloneColumns, getColumnIndex]
    );

    React.useEffect(() => {
        StorageService.setColumns(columns);
    }, [columns]);

    const contentCardKanbanChange = (dataClick: number) => {
        // здесь находится функционал, меняющий содержимое канбана

        // в данном случае после клика, используя полученное значение, находим нужные данные и сохраняем в state приложения

        let userData;
        setChoosedUserId(dataClick)
        setContentCardKanban(usersState.filter(item => item.id === dataClick)[0].records);

    }
    React.useEffect(() => {
        contentCardKanbanChange(choosedUserId)
    }, [])

    return (
        <RecordContext.Provider value={{handleRecordHours}}>
            <Toolbar
                clearButtonDisabled={!columns.length}
                onNewColumn={handleAddColumn}
                onClearBoard={handleClearBoard}
                users={usersState}
                choosed={choosedUserId}
                contentCardKanbanChange={contentCardKanbanChange}
            />
            <div className={classes.toolbar}/>
            <Box padding={1}>
                <KanbanBoard
                    columns={columns}
                    onColumnMove={handleColumnMove}
                    onColumnEdit={handleColumnEdit}
                    onColumnDelete={handleColumnDelete}
                    onCardMove={handleCardMove}
                    onAddRecord={handleAddRecord}
                    onRecordEdit={handleRecordEdit}
                    onRecordDelete={handleRecordDelete}
                    onAllRecordDelete={handleAllRecordDelete}
                />
            </Box>
        </RecordContext.Provider>
    )
};


export default KanbanBoardContainer;
