// Пожалуйста, оптимизируйте код. Читать и масштабировать очень сложно. Как минимум, вам нужно разбить компоненты на подкомпоненты. Вдобавок - желательно комментировать код, как делаю я.

import React, {useEffect} from "react";

import Box from "@material-ui/core/Box";
import {makeStyles} from "@material-ui/core/styles";

import KanbanBoard from "PersonalKanban/components/KanbanBoard";
import {Column, Record, User} from "PersonalKanban/types";
import {
    checkColumnsEmpty,
    getCreatedAt,
    getId,
    getInitialState, getMovedUsers, getUsersFromResponse,
    reorderCards,
} from "PersonalKanban/services/Utils";
import StorageService, {getItem, setItem} from "PersonalKanban/services/StorageService";
import Toolbar from "PersonalKanban/containers/Toolbar";

import useFetch from "../../hooks/useFetch";
import {OpenProjectService} from "../../../Api/OpenProjectService";

import {defaultUsersData} from "../../../index";
import {COLUMNS_STATUSES} from "../../constants";

const useKanbanBoardStyles = makeStyles((theme) => ({
    toolbar: theme.mixins.toolbar,
}));

type KanbanBoardContainerProps = {};

export interface IRecordContext {
    handleRecordHours: (idRecord: string, hours: number) => void
}

export const RecordContext = React.createContext<IRecordContext>({
    handleRecordHours(idRecord: string, hours: number): void {
    }
})

const KanbanBoardContainer: React.FC<KanbanBoardContainerProps> = (props) => {
    let initialState = StorageService.getColumns() || [];

    const classes = useKanbanBoardStyles();

    const [usersState, setUsers] = React.useState<User[]>(defaultUsersData)

    const [choosedUserId, setChoosedUserId] = React.useState<number>(1)
    const [contentCardKanban, setContentCardKanban] = React.useState<Record[]>([]);

    const [columns, setColumns] = React.useState<Column[]>(initialState);

    if (!initialState) {
        initialState = getInitialState(contentCardKanban);

    }
    const {req, loading, setLoading} = useFetch(() => {
        OpenProjectService.getAllTasks().then(res => {
            const users = getUsersFromResponse(defaultUsersData, res)
            setUsers(users)
            contentCardKanbanChange(choosedUserId)
        }).then(() => {
            setLoading(false)
        })
    })

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
    const contentCardKanbanChange = (dataClick: number) => {
        // здесь находится функционал, меняющий содержимое канбана
        // в данном случае после клика, используя полученное значение, находим нужные данные и сохраняем в state приложения
        setChoosedUserId(dataClick)
        setContentCardKanban(usersState.filter(item => item.id === dataClick)[0].records);
    }

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

    // const handleColumnMove = React.useCallback(
    //     ({column, index}: { column: Column; index: number }) => {
    //         const updatedColumns = reorder(columns, getColumnIndex(column.id), index);
    //         setColumns(updatedColumns);
    //     },
    //
    //     [columns, getColumnIndex]
    // );

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
            const newStatusUrl = COLUMNS_STATUSES.filter(item => item.status === column.status)[0].link
            OpenProjectService.updateTask({
                lockVersion: record.lockVersion,
                _links: {
                    status: {
                        href: newStatusUrl
                    }
                }
            }, record.item_id)

            setColumns(updatedColumns);
            const bufferUsers = getMovedUsers(usersState, choosedUserId, record, column, changedDT)
            setUsers([...bufferUsers])
        },

        [columns, getRecordIndex, usersState, props]
    );
    const handleRecordHours = React.useCallback((idRecord: string, hours: number) => {
        const cloneUsersState = usersState
        const indexRecord = cloneUsersState[choosedUserId - 1].records.findIndex(item => item.id === idRecord)
        cloneUsersState[choosedUserId - 1].records[indexRecord].hours = hours
        setUsers([...cloneUsersState])
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
    }, [columns, contentCardKanban]);

    React.useEffect(() => {
        req()
    }, [])
    React.useEffect(() => {
        initialState = getInitialState(contentCardKanban.sort((a, b) => {
            // @ts-ignore
            return new Date(b.start_date) - new Date(a.start_date)
        }));
        setColumns(initialState);
        StorageService.setUsers(usersState)
    }, [contentCardKanban]);

    return (
        <RecordContext.Provider value={{handleRecordHours}}>

            <Toolbar
                clearButtonDisabled={!columns?.length}
                onNewColumn={handleAddColumn}
                onClearBoard={handleClearBoard}
                users={usersState}
                choosed={choosedUserId}
                contentCardKanbanChange={contentCardKanbanChange}
            />
            <div className={classes.toolbar}/>

            <Box padding={1}>
                {
                    !loading ?
                        <KanbanBoard
                            columns={columns}
                            onColumnEdit={handleColumnEdit}
                            onColumnDelete={handleColumnDelete}
                            onCardMove={handleCardMove}
                            onAddRecord={handleAddRecord}
                            onRecordEdit={handleRecordEdit}
                            onRecordDelete={handleRecordDelete}
                            onAllRecordDelete={handleAllRecordDelete}
                        /> :
                        <p>Загрузка</p>
                }

            </Box>
        </RecordContext.Provider>
    )
};


export default KanbanBoardContainer;
