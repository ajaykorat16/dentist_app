import React, { useEffect, useState } from 'react'
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import PageHeader from '../components/PageHeader';
import Loader from '../components/Loader';
import { userNav } from '../components/NavigationPath';
import Layout from '../components/Layout';
import AddClinic from '../components/AddClinic';
import { useClinic } from '../contexts/ClinicContext';

function ClnicList() {
    const { getAllClinics, deleteClinic } = useClinic()

    const [clinics, setClinics] = useState([])
    const [sortField, setSortField] = useState('created_at');
    const [filter, setFilter] = useState('');
    const [sortOrder, setSortOrder] = useState(-1);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [clinicVisible, setClinicVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editClinicId, setEditClinicId] = useState(null);
    const [debouncedFilter, setDebouncedFilter] = useState('');

    useEffect(() => {
        const debounceTimeout = setTimeout(() => {
            setDebouncedFilter(filter);
        }, 500);

        return () => clearTimeout(debounceTimeout);
    }, [filter]);

    const fetchClinics = async () => {
        try {
            setIsLoading(true);
            const clinicList = await getAllClinics(currentPage, rowsPerPage, sortField, sortOrder, debouncedFilter);
            if (clinicList && clinicList?.length !== 0) {
                setClinics(clinicList?.data)
                setTotalRecords(clinicList?.totalCount)
            }
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching roles', error);
        }
    };

    useEffect(() => {
        fetchClinics();
    }, [currentPage, rowsPerPage, sortField, sortOrder, debouncedFilter]);

    const handleSorting = async (e) => {
        const field = e.sortField;
        const order = e.sortOrder;

        setSortField(field);
        setSortOrder(order);
        fetchClinics()
    };

    const onPageChange = (event) => {
        const newCurrentPage = Math.floor(event.first / event.rows) + 1;
        setCurrentPage(newCurrentPage);
        const newRowsPerPage = event.rows;
        setRowsPerPage(newRowsPerPage);
    };

    const handleDelete = async (deviceId) => {
        try {
            const confirmed = await confirmDelete();

            if (confirmed) {
                await deleteClinic(deviceId);
                fetchClinics();
            }
        } catch (error) {
            console.error('Error during delete operation', error);
        }
    }

    const confirmDelete = async () => {
        return new Promise((resolve) => {
            confirmDialog({
                message: 'Are you sure you want to delete this clinic?',
                header: 'Delete Confirmation',
                icon: 'pi pi-info-circle',
                position: 'top',
                accept: () => resolve(true),
                reject: () => resolve(false),
            });
        });
    };

    const handleUpdate = async (userId) => {
        setEditClinicId(userId);
        setEditMode(true);
        setClinicVisible(false);
    }

    return (
        <Layout items={userNav.items} navTitle={userNav.header}>
            <div className="d-flex flex-column w-100">
                <PageHeader
                    title={'Clinics'}
                    filter={filter}
                    setFilter={setFilter}
                    buttonLabel={'Add New Clinic'}
                    buttonOnClick={() => setClinicVisible(true)}
                />
                <div className='px-4 py-2'>
                    <ConfirmDialog />
                    {(clinicVisible || (editMode && editClinicId)) && (
                        <AddClinic
                            editMode={editMode}
                            editClinicId={editClinicId}
                            setEditClinicId={setEditClinicId}
                            setEditMode={setEditMode}
                            visible={clinicVisible}
                            setVisible={setClinicVisible}
                            fetchClinics={fetchClinics}
                        />
                    )}
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
                            onSort={(e) => {
                                if (!e.sortField && e.sortOrder === 0) {
                                    handleSorting({ sortField: 'created_at', sortOrder: -1 });
                                } else {
                                    handleSorting(e);
                                }
                            }}
                            removableSort
                            rows={rowsPerPage}
                            value={clinics}
                            first={(currentPage - 1) * rowsPerPage}
                            onPage={onPageChange}
                            dataKey="id"
                            emptyMessage="No clinics found."
                        >
                            <Column
                                field="name"
                                header="Name"
                                sortable
                                filterField="name"
                            />
                            <Column
                                field="address"
                                header="Address"
                                sortable
                                filterField="address"
                            />
                            <Column
                                header="Action"
                                className='action_td'
                                align="left"
                                body={(rowData) => (
                                    <>
                                        <i className="pi pi-pencil pointerCursor" title='Edit' onClick={() => handleUpdate(rowData?.id)} />
                                        <i className="pi pi-trash ms-2 pointerCursor" title='Delete' aria-label="Cancel" onClick={() => handleDelete(rowData?.id)} />
                                    </>
                                )}
                            />
                        </DataTable>
                    )}
                </div>
            </div>
        </Layout>
    )
}

export default ClnicList