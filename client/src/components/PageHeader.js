import React from 'react';
import { Button } from '@mui/material';
import { CFormInput } from '@coreui/react';

function PageHeader({
    title,
    buttonLabel,
    buttonOnClick,
    filter,
    setFilter,
    dropdownComponent
}) {
    return (
        <div className="d-flex flex-row justify-content-between px-4 py-2 w-100 border-bottom">
            <h4>{title}</h4>
            <div className="d-flex align-items-center">
                <CFormInput
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    type="search"
                    placeholder="Search..."
                    className="me-3"
                />
                {dropdownComponent && (
                    <div className="me-3">
                        {dropdownComponent}
                    </div>
                )}
                {buttonLabel && (
                    <Button
                        variant="outlined"
                        color="success"
                        onClick={buttonOnClick}
                        sx={{
                            fontWeight: 'bold', 
                            width: '100%'
                        }}
                    >
                        {buttonLabel}
                    </Button>
                )}
            </div>
        </div>
    );
}

export default PageHeader;
