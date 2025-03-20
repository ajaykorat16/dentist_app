import React from 'react';
import SideNav from './SideNav';
import { Toast } from 'primereact/toast'
import { useAuth } from '../contexts/AuthContext'

const Layout = ({ children, items, navTitle }) => {
  const { toast } = useAuth();

  return (
    <div className='d-flex flex-col'>
      <div className="d-sm-flex flex-sm-row flex-grow-1">
        <SideNav items={items} navTitle={navTitle} />
        <Toast ref={toast} />
        {children}
      </div>
    </div>
  );
};

export default Layout;
