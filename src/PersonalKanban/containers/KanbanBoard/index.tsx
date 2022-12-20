// Пожалуйста, оптимизируйте код. Читать и масштабировать очень сложно. Как минимум, вам нужно разбить компоненты на подкомпоненты. Вдобавок - желательно комментировать код, как делаю я.

import React from "react";

import Box from "@material-ui/core/Box";
import {makeStyles} from "@material-ui/core/styles";

import KanbanBoard from "PersonalKanban/components/KanbanBoard";
import {Column, Record, User} from "PersonalKanban/types";
import {getCreatedAt, getId, getInitialState, reorder, reorderCards,} from "PersonalKanban/services/Utils";
import StorageService from "PersonalKanban/services/StorageService";
import Toolbar from "PersonalKanban/containers/Toolbar";
import {RecordStatus} from "../../enums";

const useKanbanBoardStyles = makeStyles((theme) => ({
    toolbar: theme.mixins.toolbar,
}));

type KanbanBoardContainerProps = {};

const KanbanBoardContainer: React.FC<KanbanBoardContainerProps> = (props) => {
    let initialState = StorageService.getColumns();
    const [usersState, setUsers] = React.useState<User[]>([
        {
            id: 1,
            name: "Сергей Бабин",
            records: [
                {
                    id: getId(),
                    description: "Содержимое 1й карточки Сергея",
                    title: "3456",
                    status: RecordStatus.Plan
                },
                {
                    id: getId(),
                    description: "Содержимое 1й карточки Сергея",
                    title: "3456",
                    status: RecordStatus.Plan
                },
                {
                    id: getId(),
                    description: "Содержимое 1й карточки Сергея",
                    title: "3456",
                    status: RecordStatus.Progress
                },
                {
                    id: getId(),
                    description: "Содержимое 2й карточки Сергея",
                    title: "3466",
                    status: RecordStatus.Inspection
                },
                {
                    id: getId(),
                    description: "Содержимое 2й карточки Сергея",
                    title: "3466",
                    status: RecordStatus.Inspection
                },
                {
                    id: getId(),
                    description: "Содержимое 3й карточки Сергея",
                    title: "3476",
                    status: RecordStatus.Inspection
                },
                {id: getId(), description: "Принести ключ на 8", title: "34786", status: RecordStatus.Inspection},
            ]
        },
        {
            id: 2,
            name: "Александр Голубков",
            records: [

                {
                    id: getId(),
                    description: "Содержимое 1й карточки Александра",
                    title: "3456",
                    status: RecordStatus.Plan
                },
                {
                    id: getId(),
                    description: "Содержимое 1й карточки Александра",
                    title: "3456",
                    status: RecordStatus.Progress
                },
                {
                    id: getId(),
                    description: "Содержимое 2й карточки Александра",
                    title: "3466",
                    status: RecordStatus.Progress
                },
                {
                    id: getId(),
                    description: "Содержимое 3й карточки Александра",
                    title: "3476",
                    status: RecordStatus.Progress
                },
                {id: getId(), description: "Принести ключ на 8", title: "34786", status: RecordStatus.Inspection},

            ]
        },
        {
            id: 3,
            name: "Александр Плаксюк",
            records: [
                {
                    id: getId(),
                    description: "Содержимое 1й карточки Александра",
                    title: "3456",
                    status: RecordStatus.Plan
                },
                {
                    id: getId(),
                    description: "Содержимое 2й карточки Александра",
                    title: "3466",
                    status: RecordStatus.Progress
                },
                {
                    id: getId(),
                    description: "Содержимое 3й карточки Александра",
                    title: "3476",
                    status: RecordStatus.Inspection
                },
                {id: getId(), description: "Принести ключ на 8", title: "34786", status: RecordStatus.Inspection},

            ]
        }
    ])
    const [choosedUserId, setChoosedUserId] = React.useState<number>(1)
    // let initialState;
    // здесь будет храниться содержимое только того канбана (ряд карточек определённого пользователя), которого выбрал пользователь
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
            const updatedColumns = reorderCards({
                columns,
                destinationColumn: column,
                destinationIndex: index,
                sourceColumn: source,
                sourceIndex: getRecordIndex(record.id, source.id)!,
            });

            setColumns(updatedColumns);
        },
        [columns, getRecordIndex]
    );

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
                        status: record.status,
                        createdAt: getCreatedAt(),
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
        // if (dataClick === "Сергей Бабин") {
        //     userData = [
        //         {id: getId(), description: "Содержимое 1й карточки Сергея", title: "3456", status: RecordStatus.Plan},
        //         {
        //             id: getId(),
        //             description: "Содержимое 2й карточки Сергея",
        //             title: "3466",
        //             status: RecordStatus.Progress
        //         },
        //         {
        //             id: getId(),
        //             description: "Содержимое 3й карточки Сергея",
        //             title: "3476",
        //             status: RecordStatus.Inspection
        //         },
        //         {id: getId(), description: "Принести ключ на 8", title: "34786", status: RecordStatus.Inspection},
        //     ]
        //
        //     setContentCardKanban(userData);
        // } else if (dataClick === "Александр Голубков") {
        //     userData = [
        //         {id: getId(), description: "Содержимое 1й карточки Алекса", title: "4456", status: RecordStatus.Plan},
        //         {
        //             id: getId(),
        //             description: "Содержимое 2й карточки Алекса",
        //             title: "4466",
        //             status: RecordStatus.Progress
        //         },
        //         {
        //             id: getId(),
        //             description: "Содержимое 3й карточки Алекса",
        //             title: "4476",
        //             status: RecordStatus.Inspection
        //         },
        //     ]
        //
        //     setContentCardKanban(userData);
        // } else if (dataClick === "Александр Плаксюк") {
        //     userData = [
        //         {id: getId(), description: "Содержимое 1й карточки Саши", title: "5456", status: RecordStatus.Plan},
        //         {id: getId(), description: "Содержимое 2й карточки Саши", title: "5466", status: RecordStatus.Progress},
        //         {
        //             id: getId(),
        //             description: "Содержимое 3й карточки Саши",
        //             title: "5476",
        //             status: RecordStatus.Inspection
        //         },
        //     ]


    }
    React.useEffect(() => {
        contentCardKanbanChange(choosedUserId)
    }, [])

    return (
        <>
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
        </>
    )
};




export default KanbanBoardContainer;
