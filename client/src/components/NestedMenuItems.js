// NestedMenuItem.js
import React, { useState } from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import { List, ListItem, Tooltip } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

const NestedMenuItems = ({ item }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const [openNested, setOpenNested] = useState(false);

    const handleClick = () => {
        setOpenNested(!openNested);
    };

    const isActive = item.to && (location.pathname.includes(item.to) || item.parentMatch);

    return (
        <>
            <Tooltip title={item.title}>
                <div>
                    <ListItemButton
                        onClick={() => item?.to ? navigate(item.to) : handleClick()}
                        sx={{
                            '&:hover': {
                                borderLeft: `4px solid #7eabc0`,
                            },
                            backgroundColor: isActive ? `${item.parentMatch ? '#303C54' : '#7eabc0'}` : 'inherit',
                            marginRight: '4px'
                        }}
                    >
                        {item?.icon &&
                            <ListItemIcon>{item.icon}</ListItemIcon>
                        }
                        <ListItemText primary={item.text} />
                        {item?.children?.length && (openNested ? <ExpandLess /> : <ExpandMore />)}
                    </ListItemButton>
                    <Collapse in={openNested} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding>
                            {item?.children?.map((child, index) => (
                                <ListItem key={child.text} disablePadding>
                                    <ListItemButton>
                                        <ListItemIcon>
                                            {child.icon}
                                        </ListItemIcon >
                                        <ListItemText primary={child.text} />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    </Collapse>
                </div>
            </Tooltip>
        </>
    );
};

export default NestedMenuItems;
