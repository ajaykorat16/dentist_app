import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import Drawer from '@mui/material/Drawer'
import Divider from '@mui/material/Divider';
import ListItem from '@mui/material/ListItem';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import {
    Menu,
    ExitToApp
} from '@mui/icons-material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { useMediaQuery } from 'react-responsive';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from "../contexts/AuthContext";
import NestedMenuItem from './NestedMenuItems';

const SideNav = ({ items, navTitle }) => {
    const { auth } = useAuth()

    const [open, setOpen] = useState(true);
    const isSmallScreen = useMediaQuery({ maxWidth: 767 });
    const iconStyle = { color: "white", cursor: "pointer" }
    const location = useLocation();

    useEffect(() => {
        if (isSmallScreen) {
            setOpen(false)
            toggleDrawer(false)
        } else {
            setOpen(true)
            toggleDrawer(true)
        }
    }, [isSmallScreen]);

    const toggleDrawer = (open) => (event) => {
        if (
            event &&
            event.type === 'keydown' &&
            ((event.key === 'Tab') ||
                (event.key === 'Shift'))
        ) {
            return;
        }

        setOpen(open);
    };

    const navItems = [
        auth?.user?.role_id === 1 && {
            title: "Admin",
            icon: <LocalHospitalIcon sx={iconStyle} />,
            to: "/admin/user/list",
            parentMatch: location.pathname.includes("/admin/user"),
        },
        auth?.user?.role_id === 2 && {
            title: "Doctor",
            icon: <LocalHospitalIcon sx={iconStyle} />,
            to: "/doctor/appointment/list",
            parentMatch: location.pathname.includes("/doctor/appointment"),
        },
    ].filter(Boolean);

    return (
        <>
            <div className={`sticky-top d-sm-block d-md-none`}>
                <div className="container">
                    <div className="row align-items-center justify-content-between">
                        <div className="col-auto">
                            <p className={`mb-0 text-2xl font-bold`}>{navTitle}</p>
                        </div>
                        <div className="col-auto">
                            <div
                                className="hamburgerMenu"
                                onClick={() => {
                                    setOpen((prev) => !prev);
                                }}
                            >
                                <span className="icon">
                                    <Menu />
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {isSmallScreen ? (
                <SwipeableDrawer
                    anchor="left"
                    open={open}
                    onClose={toggleDrawer(false)}
                    onOpen={toggleDrawer(true)}
                    sx={{
                        '& .MuiDrawer-paper': {
                            backgroundColor: '#212a3a',
                            color: 'white',
                        }
                    }}
                >
                    <SidebarContent navItems={navItems} iconStyle={iconStyle} items={items} navTitle={navTitle} />
                </SwipeableDrawer>
            ) : (
                <Drawer
                    sx={{
                        padding: '16px',
                        width: 270,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: 270,
                            height: "100%",
                            boxSizing: 'border-box',
                            backgroundColor: '#212a3a',
                            color: 'white',
                        },
                    }}
                    anchor="left"
                    variant="persistent"
                    open={open}
                >
                    <SidebarContent navItems={navItems} iconStyle={iconStyle} items={items} navTitle={navTitle} />
                </Drawer>
            )}
        </>
    );
};

const SidebarContent = ({ navItems, iconStyle, items, navTitle }) => {
    const { auth, logout } = useAuth();
    const navigate = useNavigate()

    const handleLogout = async () => {
        await logout()
        navigate("/login")
    }

    return (
        <Box
            sx={{
                width: "auto",
                backgroundColor: '#303c54',
                color: 'white',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}
        >
            <div className='d-flex flex-row icons_container'>
                <div className='icons_list'>
                    <h3 className="mx-3 my-2 cursor-pointer" onClick={() => navigate("/admin/dashboard/view")}>
                        {/* <img src={''} className='navLogo' /> */}
                    </h3>
                    <List sx={{
                        '& .css-16ac5r2-MuiButtonBase-root-MuiListItemButton-root': {
                            padding: '15px 18px',
                            margin: 0
                        }
                    }}>
                        {navItems.map((nav, index) => (
                            <NestedMenuItem key={index} item={nav} />
                        ))}
                    </List>
                </div>
                <div className='sub_nav_container'>
                    <h4 className="mx-3">
                        {navTitle}
                    </h4>
                    <List sx={{
                        '& .css-16ac5r2-MuiButtonBase-root-MuiListItemButton-root': {
                            padding: '10px 20px',
                            margin: 0
                        }
                    }}>
                        {items.map((nav, index) => (
                            <NestedMenuItem key={index} item={nav} />
                        ))}
                    </List>
                </div>
            </div>
            <Divider />
            <List sx={{
                backgroundColor: '#212a3a',
                color: 'white',
            }}>
                <ListItem key="icons_group" className="d-flex justify-content-end p-2" disablePadding>
                    <div title='Logout' >
                        <ExitToApp sx={iconStyle} onClick={() => handleLogout()} />
                    </div>
                </ListItem>
            </List>
        </Box>
    );
}

export default SideNav;
