import React, { useEffect, useState } from 'react'
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import Loader from '../components/Loader';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { useAppointment } from '../contexts/AppointmentContext';
import { Toast } from 'primereact/toast';
import CancelAppointment from '../components/CancelAppointment';
import EditAppointment from '../components/EditAppointment';
import { format } from 'date-fns';
import { Button } from '@mui/material';
import MedicalHistoryView from '../components/MedicalHistoryView';

const UserAppointment = () => {
    const { auth, toast } = useAuth()
    const { getAllAppointment } = useAppointment()

    const [appointments, setAppointments] = useState([])
    const [sortField, setSortField] = useState('appointment_time');
    const [filter, setFilter] = useState('');
    const [sortOrder, setSortOrder] = useState(-1);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [debouncedFilter, setDebouncedFilter] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [cancelMode, setCancelMode] = useState(false);
    const [editAppointmentId, setEditAppointmentId] = useState(null);
    const [medHistoryView, setMedHistoryView] = useState(false)

    useEffect(() => {
        const debounceTimeout = setTimeout(() => {
            setDebouncedFilter(filter);
        }, 500);

        return () => clearTimeout(debounceTimeout);
    }, [filter]);

    const fetchAppointments = async () => {
        try {
            setIsLoading(true);
            const appointmentList = await getAllAppointment(currentPage, rowsPerPage, sortField, sortOrder, debouncedFilter);
            if (appointmentList && appointmentList?.length !== 0) {
                setAppointments(appointmentList?.data)
                setTotalRecords(appointmentList?.totalCount)
            }
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching appointment', error);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, [currentPage, rowsPerPage, sortField, sortOrder, debouncedFilter]);

    const onPageChange = (event) => {
        const newCurrentPage = Math.floor(event.first / event.rows) + 1;
        setCurrentPage(newCurrentPage);
        const newRowsPerPage = event.rows;
        setRowsPerPage(newRowsPerPage);
    };

    const handleSorting = async (e) => {
        const field = e.sortField;
        const order = e.sortOrder;

        setSortField(field);
        setSortOrder(order);
        fetchAppointments()
    };


    const reSchedule = (appointmentId) => {
        setEditAppointmentId(appointmentId);
        setEditMode(true);
    }

    const handleCancel = (appointmentId) => {
        setEditAppointmentId(appointmentId);
        setCancelMode(true);
    };

    const handleMedView = (appointmentId) => {
        setEditAppointmentId(appointmentId);
        setMedHistoryView(true);
    }

    const formatAppointmentTime = (rowData) => {
        const date = new Date(rowData.appointment_time);
        return format(date, 'dd-MM-yyyy HH:mm');
    };

    return (
        <div className='home-page'>
            {/* // <!-- Navbar Start --> */}
            <Navbar />
            <Toast ref={toast} />
            <CancelAppointment
                editAppointmentId={editAppointmentId}
                setEditAppointmentId={setEditAppointmentId}
                editMode={cancelMode}
                setEditMode={setCancelMode}
                fetchAppointments={fetchAppointments}
            />
            <EditAppointment
                editAppointmentId={editAppointmentId}
                setEditAppointmentId={setEditAppointmentId}
                editMode={editMode}
                setEditMode={setEditMode}
                fetchAppointments={fetchAppointments}
            />
            {medHistoryView &&
                <MedicalHistoryView
                    appointmentId={editAppointmentId}
                    setAppointmentId={setEditAppointmentId}
                    setMedHistoryView={setMedHistoryView}
                    medHistoryView={medHistoryView}
                />
            }
            {/* // <!-- Navbar End --> */}

            <div className='px-4 py-4 d-flex flex-column align-items-center'>
                <h3 class="mb-3 appointment_table">Appointment history</h3>
                {isLoading ? (
                    <Loader />
                ) : (
                    <DataTable
                        className="appointment_table thead-dark"
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
                        value={appointments}
                        first={(currentPage - 1) * rowsPerPage}
                        onPage={onPageChange}
                        dataKey="id"
                        emptyMessage="No appointments found."
                    >
                        <Column
                            field="doctor_name"
                            header="Doctor"
                            sortable
                            filterField="doctor_name"
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
                                            return { backgroundColor: '#e0f7fa', color: '#00796b', padding: '4px 8px', borderRadius: '4px' };
                                        case 'completed':
                                            return { backgroundColor: '#e8f5e9', color: '#388e3c', padding: '4px 8px', borderRadius: '4px' };
                                        case 'cancelled':
                                            return { backgroundColor: '#ffebee', color: '#d32f2f', padding: '4px 8px', borderRadius: '4px' };
                                        default:
                                            return { backgroundColor: '#f5f5f5', color: '#616161', padding: '4px 8px', borderRadius: '4px' };
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
                            field="cancel_reason"
                            header="Cancel reason"
                            sortable
                            filterField="cancel_reason"
                        />
                        <Column
                            header="Action"
                            className="action_td"
                            align="left"
                            body={(rowData) => (
                                <>
                                    <Button
                                        variant="contained"
                                        color="info"
                                        onClick={() => handleMedView(rowData?.id)}
                                    >
                                        Info
                                    </Button>
                                    {rowData.status === "scheduled" && (
                                        <>
                                            <Button
                                                variant="contained"
                                                color="success"
                                                onClick={() => reSchedule(rowData?.id)}
                                                className="table_btn"
                                            >
                                                Reschedule
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="error"
                                                className="table_btn"
                                                onClick={() => handleCancel(rowData?.id)}
                                            >
                                                Cancel
                                            </Button>
                                        </>
                                    )}
                                </>
                            )}
                        />

                    </DataTable>
                )}
            </div>

            {/* <!-- Footer Start --> */}
            <div className="container-fluid footer_bg text-light mt-5 py-5">
                <div className="container py-5">
                    <div className="row g-5">
                        <div className="col-lg-3 col-md-6">
                            <h4 className="d-inline-block text-primary text-uppercase border-bottom border-5 border-secondary mb-4">Get In Touch</h4>
                            <p className="mb-4">No dolore ipsum accusam no lorem. Invidunt sed clita kasd clita et et dolor sed dolor</p>
                            <p className="mb-2"><i className="fa-solid fa-map-marker-alt text-primary me-3"></i>123 Street, New York, USA</p>
                            <p className="mb-2"><i className="fa-solid fa-envelope text-primary me-3"></i>info@example.com</p>
                            <p className="mb-0"><i className="fa-solid fa-phone-alt text-primary me-3"></i>+012 345 67890</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container-fluid footer_bg text-light border-top border-secondary py-4">
                <div className="container">
                    <div className="row g-5">
                        <div className="col-md-6 text-center text-md-start">
                            <p className="mb-md-0">&copy; <a className="text-primary" href="#">Your Site Name</a>. All Rights Reserved.</p>
                        </div>
                        <div className="col-md-6 text-center text-md-end">
                            <p className="mb-0">Designed by <a className="text-primary" href="https://htmlcodex.com">HTML Codex</a></p>
                        </div>
                    </div>
                </div>
            </div>
            {/* <!-- Footer End --> */}
        </div>
    )
}

export default UserAppointment