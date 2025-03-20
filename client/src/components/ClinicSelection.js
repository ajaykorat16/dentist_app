import React, { useState } from 'react';
import { AsyncPaginate } from 'react-select-async-paginate';
import { CFormLabel } from '@coreui/react';
import { useClinic } from '../contexts/ClinicContext';

const ClinicSelection = ({ className, labelClassName, multiSelect = true, required = false, error = false, menuPlacement = 'bottom', onChange, value }) => {
    const requiredIcon = required ? <span className="text-danger">*</span> : null;
    const { getAllClinics } = useClinic()

    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(50);


    const fetchClinics = async (searchValue, loadedOptions, { page }) => {
        try {
            const response = await getAllClinics(page, rowsPerPage, 'id', -1, searchValue);

            if (response.totalPages > 0) {
                const newOptions = response.data.map((clinic) => ({
                    label: clinic?.name,
                    value: clinic?.id,
                }));

                return {
                    options: newOptions,
                    hasMore: page !== response.totalPages,
                    additional: {
                        page: page + 1,
                    },
                };
            } else {
                return {
                    options: [],
                    hasMore: false,
                    additional: null,
                };
            }
        } catch (error) {
            console.error('Error fetching clincs', error);
            return {
                options: [],
                hasMore: false,
                additional: null,
            };
        }
    };

    const customStyles = {
        option: (provided, state) => ({
            ...provided,
            whiteSpace: state.isFocused ? 'pre-wrap' : 'nowrap',
            wordBreak: state.isFocused ? 'break-all' : null,
            wordWrap: state.isFocused ? 'break-word' : null,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        }),
        menu: (provided) => ({
            ...provided,
            zIndex: 9999,
        }),
        menuPortal: (provided) => ({
            ...provided,
            zIndex: 9999,
        }),
    };
    return (
        <div className={className}>
            <div className={labelClassName}>
                <CFormLabel>Clinic {requiredIcon}</CFormLabel>
            </div>
            <div className='w-100'>
                <AsyncPaginate
                    className={`${(error && required) && 'multiSelect_error'}`}
                    value={value}
                    loadOptions={fetchClinics}
                    isMulti={multiSelect}
                    closeMenuOnSelect={!multiSelect ? true : false}
                    onChange={onChange}
                    placeholder='Select clincs...'
                    noOptionsMessage={() => ('No clinics found')}
                    loadingMessage={() => ('Clinics Loading...')}
                    loadOptionsOnMenuOpen={true}
                    additional={{
                        page: currentPage,
                    }}
                    SelectProps={{
                        isSearchable: true,
                        removeSelected: false,
                    }}
                    menuPlacement={menuPlacement}
                    // defaultMenuIsOpen={true}
                    menuShouldScrollIntoView={false}
                    menuPortalTarget={document.querySelector('body')}
                    styles={customStyles}
                />
                {(error && required) && <span className="text-danger error_message">{multiSelect ? `Please select one or more clinic(s)` : 'Please select any one clinic.'}</span>}
            </div>
        </div>
    );
};

export default ClinicSelection;
