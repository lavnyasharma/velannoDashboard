import { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import axiosInstance from 'src/utils/axios';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { useBoolean } from 'src/hooks/use-boolean';
import { DashboardContent } from 'src/layouts/dashboard';
import { toast } from 'src/components/snackbar';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import * as XLSX from 'xlsx';

import {
  useTable,
  TableNoData,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';
import { useTheme } from '@emotion/react';
import { OrderTableRow } from '../order-table-row';


const TABLE_HEAD = [
  { id: 'orderNumber', label: 'Select', width: 88 },
  { id: 'orderNumber', label: 'Order', width: 88 },
  { id: 'name', label: 'Customer' },
  { id: 'createdAt', label: 'Date', width: 140 },
  { id: 'totalQuantity', label: 'Items', width: 120, align: 'center' },
  { id: 'totalAmount', label: 'Price', width: 140 },
  { id: 'paymentmethod', label: 'Payment Method', width: 140 },
  { id: 'actions', label: 'Actions', width: 140 },
];

export function OrderReportListView() {
  const [term, setTerm] = useState('')
  const [listData, setListData] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const theme = useTheme();

  const [summaryData, setSummaryData] = useState({});

  const table = useTable({
    defaultOrderBy: 'hsn',
    defaultRowsPerPage: rowsPerPage,
  });

  const router = useRouter();
  const confirm = useBoolean();

  const getListData = useCallback(async (limit, offset) => {
    setLoading(true);
    try {
      const params = {
        limit,
        offset,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        search: searchTerm || undefined,
      };

      const { data } = await axiosInstance.get('/order-lists/', { params });
      setListData(data.results);
      setTotalRows(data.count);
    } catch (error) {
      toast.error('Error fetching orders');
    }
    setLoading(false);
  }, [startDate, endDate, searchTerm]);

  const getSummaryData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      };

      const { data } = await axiosInstance.get('/order/summary/seller/', { params });
      setSummaryData(data);
    } catch (error) {
      toast.error('Error fetching orders');
    }
    setLoading(false);
  }, [startDate, endDate]);

  useEffect(() => {
    getListData(rowsPerPage, page * rowsPerPage);
    getSummaryData();
  }, [getListData, getSummaryData, page, rowsPerPage]);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleDateChange = (event, isStart) => {
    const date = event.target.value;
    if (isStart) {
      setStartDate(date);
    } else {
      setEndDate(date);
    }
    setPage(0);
  };

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSearchTerm('');
    setPage(0);
    setTerm('')
  };

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.order.details(id));
    },
    [router]
  );



  const downloadExcel = async () => {
    const { data } = await axiosInstance.get('/order-lists/?limit=1000',);
    const results = data.results
    // Extract the headers for the Excel file
    const headers = [
      'Order Number', 'Customer Name', 'Phone', 'Order Date', 'Product ID', 'Product Name', 'Category',
      'Collection', 'Price', 'Quantity', 'Total Price', 'Payment Method'
    ];

    // Process each order and item to create rows for the Excel file
    const rows = results.flatMap(order =>
      order.items.map(item => [
        order.order_number,
        order.cname,
        order.phone,
        order.created,
        item.product.id,
        item.product.title,
        item.product.category,
        item.product.collection,
        item.product.price,
        item.quantity,
        item.total,
        order.payment_method || 'N/A'
      ])
    );

    // Create a worksheet and add headers and rows
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Items Sold');

    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, 'items_sold_report.xlsx');
  };
  return (
    <DashboardContent>
      <Card>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              label="Search"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setSearchTerm(term);
                  setPage(0);
                }
              }}
              variant="outlined"
              sx={{ width: 250 }}
            />
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => handleDateChange(e, true)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => handleDateChange(e, false)}
              InputLabelProps={{ shrink: true }}
            />
            <Button onClick={handleResetFilters}>Reset Filters</Button>
          </Box>
          <Button variant="contained" color="primary" onClick={downloadExcel}>Download as CSV</Button> {/* Download Button */}
        </Box>
        <Scrollbar sx={{ minHeight: 444 }}>
          <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
            <TableHeadCustom headLabel={TABLE_HEAD} />
            <TableBody>
              {loading ? (
                <TableNoData colSpan={TABLE_HEAD.length} />
              ) : (
                listData.map((row) => (
                  <OrderTableRow key={row.id} row={row} selected={table.selected.includes(row.id)} onSelectRow={() => table.onSelectRow(row.id)} onViewRow={() => handleViewRow(row.id)} />
                ))
              )}
            </TableBody>
          </Table>
        </Scrollbar>
        <TablePaginationCustom
          rowsPerPageOptions={[5, 10, 25]}
          count={totalRows}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      </Card>
      <ConfirmDialog
        open={confirm.open}
        onClose={confirm.onClose}
        title="Confirmation"
        content="Are you sure you want to delete this order?"
        onConfirm={confirm.onConfirm}
      />
    </DashboardContent>
  );
}
