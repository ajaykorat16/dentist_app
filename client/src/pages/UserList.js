import React, { useEffect, useState } from 'react'
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import PageHeader from '../components/PageHeader';
import Loader from '../components/Loader';
import { useUser } from '../contexts/UserContext';
import { userNav } from '../components/NavigationPath';
import Layout from '../components/Layout';
import AddUser from '../components/AddUser';
import { useAuth } from '../contexts/AuthContext';
import { Checkbox, Switch } from '@mui/material';
import { CFormLabel } from '@coreui/react';

function UserList() {
    const { getAllUsers, deleteUser } = useUser()
    const { auth } = useAuth()

    const [userList, setUserList] = useState([])
    const [sortField, setSortField] = useState('created_at');
    const [filter, setFilter] = useState('');
    const [sortOrder, setSortOrder] = useState(-1);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [userVisible, setUserVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editUserId, setEditUserId] = useState(null);
    const [debouncedFilter, setDebouncedFilter] = useState('');
    const [isActiveUsers, setIsActiveUsers] = useState(true)

    useEffect(() => {
        const debounceTimeout = setTimeout(() => {
            setDebouncedFilter(filter);
        }, 500);

        return () => clearTimeout(debounceTimeout);
    }, [filter]);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const users = await getAllUsers(currentPage, rowsPerPage, sortField, sortOrder, debouncedFilter, isActiveUsers);
            if (users && users?.length !== 0) {
                setUserList(users?.data)
                setTotalRecords(users?.totalCount)
            }
            setIsLoading(false);
        } catch (error) {
            console.error('Error fetching roles', error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [currentPage, rowsPerPage, sortField, sortOrder, debouncedFilter, isActiveUsers]);

    const handleSorting = async (e) => {
        const field = e.sortField;
        const order = e.sortOrder;

        setSortField(field);
        setSortOrder(order);
        fetchUsers()
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
                await deleteUser(deviceId);
                fetchUsers();
            }
        } catch (error) {
            console.error('Error during delete operation', error);
        }
    }

    const confirmDelete = async () => {
        return new Promise((resolve) => {
            confirmDialog({
                message: 'Are you sure you want to delete this user?',
                header: 'Delete Confirmation',
                icon: 'pi pi-info-circle',
                position: 'top',
                accept: () => resolve(true),
                reject: () => resolve(false),
            });
        });
    };

    const handleUpdate = async (userId) => {
        setEditUserId(userId);
        setEditMode(true);
        setUserVisible(false);
    }

    return (
        <Layout items={userNav.items} navTitle={userNav.header}>
            <div className="d-flex flex-column w-100">
                <PageHeader
                    title={'Doctors'}
                    buttonLabel={'Add New Doctor'}
                    buttonOnClick={() => setUserVisible(true)}
                    filter={filter}
                    setFilter={setFilter}
                />
                <div className='px-4 py-2'>
                    <ConfirmDialog />
                    {(userVisible || (editMode && editUserId)) && (
                        <AddUser
                            editMode={editMode}
                            editUserId={editUserId}
                            setEditUserId={setEditUserId}
                            setEditMode={setEditMode}
                            visible={userVisible}
                            setVisible={setUserVisible}
                            fetchUsers={fetchUsers}
                        />
                    )}
                    <div className='d-flex align-items-end flex-column mb-2'>
                        <div className='d-flex align-items-center'>
                            <div className="custom-checkbox">
                                <Switch
                                    checked={isActiveUsers}
                                    onChange={(e) => {
                                        setIsActiveUsers(e.target.checked)
                                    }}
                                />
                            </div>
                            <div>
                                <CFormLabel className="form-label mb-0">Active Doctors</CFormLabel>
                            </div>
                        </div>
                    </div>
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
                            value={userList}
                            first={(currentPage - 1) * rowsPerPage}
                            onPage={onPageChange}
                            dataKey="id"
                            emptyMessage="No users found."
                        >
                            <Column
                                field="first_name"
                                header="First name"
                                sortable
                                filterField="first_name"
                            />
                            <Column
                                field="last_name"
                                header="Last name"
                                sortable
                                filterField="last_name"
                            />
                            <Column
                                field="role_id"
                                header="Role"
                                sortable
                                filterField="role_id"
                                body={(rowData) => (
                                    <>
                                        {rowData.role_id === 1 && "Admin"}
                                        {rowData.role_id === 2 && "Dentist"}
                                        {rowData.role_id === 3 && "Patient"}
                                    </>
                                )}
                            />
                            <Column
                                field="degree"
                                header="Degree"
                                sortable
                                filterField="degree"
                            />
                            <Column
                                field="email"
                                header="Email"
                                sortable
                                filterField="email"
                            />
                            <Column
                                field="clinic_name"
                                header="Clinic"
                                sortable
                                filterField="clinic_name"
                            />
                            <Column
                                header="Action"
                                className='action_td'
                                align="left"
                                body={(rowData) => (
                                    <>
                                        {auth?.user?.id !== rowData.id && (<i className="pi pi-pencil pointerCursor" title='Edit' onClick={() => handleUpdate(rowData.id)} />)}
                                        {auth?.user?.id !== rowData.id && (<i className="pi pi-trash ms-2 pointerCursor" title='Delete' aria-label="Cancel" onClick={() => handleDelete(rowData.id)} />)}
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

export default UserList