import React, { useEffect, useState } from 'react';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import PageHeader from '../components/PageHeader';
import Loader from '../components/Loader';
import { userNav } from '../components/NavigationPath';
import Layout from '../components/Layout';
import { useContact } from '../contexts/ContactContext';

function ContactUsList() {
    const { getAllContacts } = useContact();

    const [contactsList, setContactsList] = useState([]);
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

    const fetchContact = async () => {
        try {
            setIsLoading(true);
            const contacts = await getAllContacts(
                currentPage,
                rowsPerPage,
                sortField,
                sortOrder,
                debouncedFilter,
            );
            if (contacts && contacts?.length !== 0) {
                setContactsList(contacts?.data);
                setTotalRecords(contacts?.totalCount);
            }
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching contact us', error);
        }
    };

    useEffect(() => {
        fetchContact();
    }, [currentPage, rowsPerPage, sortField, sortOrder, debouncedFilter]);

    const handleSorting = async (e) => {
        const field = e.sortField;
        const order = e.sortOrder;

        setSortField(field);
        setSortOrder(order);
        fetchContact();
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
                    title="Inquiries"
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
                            value={contactsList}
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
                            emptyMessage="No contact us found."
                        >
                            <Column
                                field="name"
                                header="Name"
                                sortable
                                filterField="name"
                            />
                            <Column
                                field="phone_number"
                                header="Phone"
                                sortable
                                filterField="phone_number"
                            />
                            <Column
                                field="message"
                                header="Message"
                                sortable
                                filterField="message"
                                className='audit_data'
                            />
                        </DataTable>
                    )}
                </div>
            </div>
        </Layout>
    );
}

export default ContactUsList;
