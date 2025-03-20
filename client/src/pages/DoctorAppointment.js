import React, { useEffect, useState } from 'react';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { ConfirmDialog } from 'primereact/confirmdialog';
import PageHeader from '../components/PageHeader';
import Loader from '../components/Loader';
import { doctorNav } from '../components/NavigationPath';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useAppointment } from '../contexts/AppointmentContext';
import AddNotes from '../components/AddNotes';
import ViewNotes from '../components/ViewNotes';
import { Button } from 'primereact/button';
import { format } from 'date-fns';
import 'primeicons/primeicons.css';
import { CFormSelect } from '@coreui/react';

function DoctorAppointment() {
    const { getAllAppointment, updateAppointmentStatus } = useAppointment();
    const { auth } = useAuth();

    const [appointmentList, setAppointmentList] = useState([]);
    const [sortField, setSortField] = useState('appointment_time');
    const [filter, setFilter] = useState('');
    const [sortOrder, setSortOrder] = useState(-1);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editAppointmentId, setEditAppointmentId] = useState(null);
    const [debouncedFilter, setDebouncedFilter] = useState('');
    const [noteView, setNoteView] = useState(false);
    const [statusFilter, setStatusFilter] = useState('scheduled');

    const statusOptions = [
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
    ];

    useEffect(() => {
        const debounceTimeout = setTimeout(() => {
            setDebouncedFilter(filter);
        }, 500);

        return () => clearTimeout(debounceTimeout);
    }, [filter]);

    const fetchAppointment = async () => {
        try {
            setIsLoading(true);
            const appointments = await getAllAppointment(
                currentPage,
                rowsPerPage,
                sortField,
                sortOrder,
                debouncedFilter,
                statusFilter
            );
            if (appointments && appointments?.length !== 0) {
                setAppointmentList(appointments?.data);
                setTotalRecords(appointments?.totalCount);
            }
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching appointments', error);
        }
    };

    useEffect(() => {
        fetchAppointment();
    }, [currentPage, rowsPerPage, sortField, sortOrder, debouncedFilter, statusFilter]);

    const handleSorting = async (e) => {
        const field = e.sortField;
        const order = e.sortOrder;

        setSortField(field);
        setSortOrder(order);
        fetchAppointment();
    };

    const onPageChange = (event) => {
        const newCurrentPage = Math.floor(event.first / event.rows) + 1;
        setCurrentPage(newCurrentPage);
        const newRowsPerPage = event.rows;
        setRowsPerPage(newRowsPerPage);
    };

    const handleUpdate = async (appointmentId) => {
        setEditAppointmentId(appointmentId);
        setEditMode(true);
    };

    const handleUpdateStatus = async (appointmentId) => {
        await updateAppointmentStatus(appointmentId);
        fetchAppointment();
    };

    const formatAppointmentTime = (rowData) => {
        const date = new Date(rowData.appointment_time);
        return format(date, 'dd-MM-yyyy HH:mm');
    };

    return (
        <Layout items={doctorNav.items} navTitle={doctorNav.header}>
            <div className="d-flex flex-column w-100">
                <PageHeader
                    title="Appointment"
                    filter={filter}
                    setFilter={setFilter}
                    dropdownComponent={
                        <CFormSelect
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{ minWidth: '200px', maxHeight: '40px' }}
                        >
                            {statusOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </CFormSelect>
                    }
                />
                <div className="px-4 py-2">
                    <ConfirmDialog />
                    {editMode && editAppointmentId && (
                        <AddNotes
                            editMode={editMode}
                            editAppointmentId={editAppointmentId}
                            setEditAppointmentId={setEditAppointmentId}
                            setEditMode={setEditMode}
                            fetchAppointment={fetchAppointment}
                        />
                    )}
                    {noteView && (
                        <ViewNotes
                            appointmentId={editAppointmentId}
                            setAppointmentId={setEditAppointmentId}
                            noteView={noteView}
                            setNoteView={setNoteView}
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
                            removableSort
                            rows={rowsPerPage}
                            value={appointmentList}
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
                            emptyMessage="No appointment found."
                        >
                            <Column
                                field="patient_name"
                                header="Patient"
                                sortable
                            />
                            <Column
                                field="appointment_time"
                                header="Appointment time"
                                sortable
                                filterField="appointment_time"
                                body={formatAppointmentTime}
                            />
                            <Column
                                field="status"
                                header="Status"
                                sortable
                                body={(rowData) => {
                                    const getStatusStyle = (status) => {
                                        switch (status.toLowerCase()) {
                                            case 'scheduled':
                                                return { backgroundColor: '#e0f7fa', color: '#00796b', padding: '4px 8px', borderRadius: '4px' }; // Light blue background
                                            case 'completed':
                                                return { backgroundColor: '#e8f5e9', color: '#388e3c', padding: '4px 8px', borderRadius: '4px' }; // Light green background
                                            case 'cancelled':
                                                return { backgroundColor: '#ffebee', color: '#d32f2f', padding: '4px 8px', borderRadius: '4px' }; // Light red background
                                            default:
                                                return { backgroundColor: '#f5f5f5', color: '#616161', padding: '4px 8px', borderRadius: '4px' }; // Light gray background
                                        }
                                    };

                                    return (
                                        <span style={getStatusStyle(rowData.status)}>
                                            {rowData.status}
                                        </span>
                                    );
                                }}
                            />
                            <Column
                                header="Action"
                                className="action_td"
                                align="left"
                                body={(rowData) => (
                                    <>
                                        <Button
                                            icon="pi pi-eye"
                                            rounded
                                            severity="Secondary"
                                            className="ms-2"
                                            title="View Note"
                                            onClick={() => {
                                                setNoteView(true);
                                                setEditAppointmentId(rowData?.id);
                                            }}
                                            style={{ height: '30px', width: '30px' }}
                                            raised
                                        />
                                        {rowData.status === 'scheduled' &&
                                            <Button
                                                icon="pi pi-pencil"
                                                rounded
                                                severity="info"
                                                className="ms-2"
                                                title="Edit"
                                                onClick={() => handleUpdate(rowData?.id)}
                                                raised
                                                style={{ height: '30px', width: '30px' }}
                                            ></Button>
                                        }
                                        {rowData.status === 'scheduled' &&
                                            <Button
                                                icon="pi pi-check"
                                                title="Complete"
                                                rounded
                                                className="ms-2"
                                                severity="success"
                                                onClick={() => handleUpdateStatus(rowData?.id)}
                                                style={{ height: '30px', width: '30px' }}
                                                raised
                                            />
                                        }
                                    </>
                                )}
                            />
                        </DataTable>
                    )}
                </div>
            </div>
        </Layout>
    );
}

export default DoctorAppointment;
