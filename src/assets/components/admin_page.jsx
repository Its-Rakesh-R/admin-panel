import React, { useEffect, useState } from 'react';
import './admin_page.css';
import axios from 'axios';
import search from './img/search.png';

const AdminPage = () => {
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRows, setSelectedRows] = useState([]);
    const [editingRowId, setEditingRowId] = useState(null);
    const [editingRowData, setEditingRowData] = useState({});
    const rowsPerPage = 10;

    useEffect(() => {
        axios.get('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json')
            .then((response) => {
                setData(response.data);
            })
            .catch((error) => {
                console.error('Error fetching data: ', error);
            });
    }, []);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleSearch = () => {
        setCurrentPage(1);
    };

    const handleSelectRow = (id) => {
        setSelectedRows((prevSelectedRows) =>
            prevSelectedRows.includes(id)
                ? prevSelectedRows.filter((rowId) => rowId !== id)
                : [...prevSelectedRows, id]
        );
    };

    const handleSelectAllRows = () => {
        const displayedRows = filteredData.slice(
            (currentPage - 1) * rowsPerPage,
            currentPage * rowsPerPage
        );
        const displayedRowIds = displayedRows.map((row) => row.id);
        if (displayedRowIds.every((id) => selectedRows.includes(id))) {
            setSelectedRows((prevSelectedRows) =>
                prevSelectedRows.filter((id) => !displayedRowIds.includes(id))
            );
        } else {
            setSelectedRows((prevSelectedRows) => [
                ...new Set([...prevSelectedRows, ...displayedRowIds]),
            ]);
        }
    };

    const handleEditRow = (id) => {
        setEditingRowId(id);
        const rowData = data.find((row) => row.id === id);
        setEditingRowData(rowData);
    };

    const handleSaveRow = (id) => {
        setData((prevData) =>
            prevData.map((row) =>
                row.id === id ? editingRowData : row
            )
        );
        setEditingRowId(null);
        setEditingRowData({});
    };

    const handleDeleteRow = (id) => {
        const copy = [...data];
        setData(copy.filter((row) => row.id !== id));
    };

    const handleDeleteSelected = () => {
        setData((prevData) =>
            prevData.filter((row) => !selectedRows.includes(row.id))
        );
        setSelectedRows([]);
    };

    const filteredData = data.filter((row) =>
        Object.values(row).some((value) =>
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const paginatedData = filteredData.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    return (
        <div id='background'>
            <div className="admin-page">
                <div className='head'>
                    <div className='search'>
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <img src={search} alt='search' className='search-icon' onClick={handleSearch} />
                    </div>
                </div>
                <div className='table-box'>
                    <table>
                        <thead>
                            <tr>
                                <th>
                                    <input
                                        type="checkbox"
                                        onChange={handleSelectAllRows}
                                        checked={paginatedData.every((row) =>
                                            selectedRows.includes(row.id)
                                        )}
                                    />
                                </th>
                                {data.length > 0 && Object.keys(data[0]).map((key) => (
                                    <th key={key}>{key.charAt(0).toUpperCase() + key.slice(1).toLowerCase()}</th>
                                ))}
                                <th className='action-head'>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.map((row) => (
                                <tr
                                    key={row.id}
                                    className={selectedRows.includes(row.id) ? 'selected' : ''}
                                >
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedRows.includes(row.id)}
                                            onChange={() => handleSelectRow(row.id)}
                                        />
                                    </td>
                                    {Object.keys(row).map((key) => (
                                        <td key={key}>
                                            {editingRowId === row.id ? (
                                                <input
                                                    type="text"
                                                    className='inline-change'
                                                    value={editingRowData[key]}
                                                    onChange={(e) =>
                                                        setEditingRowData({
                                                            ...editingRowData,
                                                            [key]: e.target.value,
                                                        })
                                                    }
                                                />
                                            ) : (
                                                row[key]
                                            )}
                                        </td>
                                    ))}
                                    <td className='action'>
                                        {editingRowId === row.id ? (
                                            <button onClick={() => handleSaveRow(row.id)} className='save'>Save</button>
                                        ) : (
                                            <>
                                                <button onClick={() => handleEditRow(row.id)} className='edit'>&#9998;</button>
                                                <button onClick={() => handleDeleteRow(row.id)} className='delete'><div></div></button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className='footer'>
                    <button className='deleteAll' onClick={handleDeleteSelected}>Delete Selected</button>
                    <div className="pagination">
                        <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className={`first-page ${currentPage === 1 ? 'disabled' : ''}`}
                        >
                            &#171;
                        </button>
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`previous-page ${currentPage === 1 ? 'disabled' : ''}`}
                        >
                            &#60;
                        </button>
                        {Array.from({ length: totalPages }, (_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentPage(index + 1)}
                                className={currentPage === index + 1 ? 'active' : ''}
                            >
                                {index + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className={`next-page ${currentPage === totalPages ? 'disabled' : ''}`}
                        >
                            &#62;
                        </button>
                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            className={`last-page ${currentPage === totalPages ? 'disabled' : ''}`}
                        >
                            &raquo;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;