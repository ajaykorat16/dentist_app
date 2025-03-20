import React, { useEffect, useState } from 'react';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import PageHeader from '../components/PageHeader';
import Loader from '../components/Loader';
import { userNav } from '../components/NavigationPath';
import Layout from '../components/Layout';
import { useUser } from '../contexts/UserContext';

function ActionList() {
    const { getAllActions } = useUser();

    const [actionList, setActionList] = useState([]);
    const [sortField, setSortField] = useState('created_at');
    const [filter, setFilter] = useState('');
    const [sortOrder, setSortOrder] = useState(-1);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [debouncedFilter, setDebouncedFilter] = useState('');

    useEffect(() => {
        const debounceTimeout = setTimeout(() => {
            setDebouncedFilter(filter);
        }, 500);

        return () => clearTimeout(debounceTimeout);
    }, [filter]);

    const fetchActions = async () => {
        try {
            setIsLoading(true);
            const actions = await getAllActions(
                currentPage,
                rowsPerPage,
                sortField,
                sortOrder,
                debouncedFilter,
            );
            if (actions && actions?.length !== 0) {
                setActionList(actions?.data);
                setTotalRecords(actions?.totalCount);
            }
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching actions', error);
        }
    };

    useEffect(() => {
        fetchActions();
    }, [currentPage, rowsPerPage, sortField, sortOrder, debouncedFilter]);

    const handleSorting = async (e) => {
        const field = e.sortField;
        const order = e.sortOrder;

        setSortField(field);
        setSortOrder(order);
        fetchActions();
    };

    const onPageChange = (event) => {
        const newCurrentPage = Math.floor(event.first / event.rows) + 1;
        setCurrentPage(newCurrentPage);
        const newRowsPerPage = event.rows;
        setRowsPerPage(newRowsPerPage);
    };

    return (
        <Layout items={userNav.items} navTitle={userNav.header}>
            <div className="d-flex flex-column w-100">
                <PageHeader
                    title="Actions"
                    filter={filter}
                    setFilter={setFilter}
                />
                <div className="px-4 py-2">
                    {isLoading ? (
                        <Loader />
                    ) : (
                        <DataTable
                            className="customerTable thead-dark"
                            totalRecords={totalRecords}
                            lazy
                            paginator
                            sortField={sortField}
                            sortOrder={sortOrder}
                            removableSort
                            rows={rowsPerPage}
                            value={actionList}
                            first={(currentPage - 1) * rowsPerPage}
                            onPage={onPageChange}
                            dataKey="id"
                            onSort={(e) => {
                                if (!e.sortField && e.sortOrder === 0) {
                                    handleSorting({ sortField: 'created_at', sortOrder: -1 });
                                } else {
                                    handleSorting(e);
                                }
                            }}
                            emptyMessage="No actions found."
                        >
                            <Column
                                field="full_name"
                                header="Name"
                                sortable
                                filterField="full_name"
                                body={(rowData) =>
                                    rowData.full_name ? (
                                        rowData.full_name
                                    ) : (
                                        <span style={{ display: 'block', textAlign: 'center' }}>-</span>
                                    )
                                }
                            />
                            <Column
                                field="role"
                                header="Role"
                                sortable
                                filterField="role"
                                body={(rowData) =>
                                    rowData.role ? (
                                        rowData.role
                                    ) : (
                                        <span style={{ display: 'block', textAlign: 'center' }}>-</span>
                                    )
                                }
                            />
                            <Column
                                field="action"
                                header="Action"
                                sortable
                                filterField="action"
                            />
                            <Column
                                field="description"
                                header="Description"
                                sortable
                                filterField="description"
                            />
                            <Column
                                field="data"
                                header="Data"
                                sortable
                                filterField="data"
                                className='audit_data'
                            />
                        </DataTable>
                    )}
                </div>
            </div>
        </Layout>
    );
}

export default ActionList;
