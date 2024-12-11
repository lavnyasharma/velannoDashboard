import { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import TextField from '@mui/material/TextField';
import axiosInstance from 'src/utils/axios';
import { paths } from 'src/routes/paths';
import { DashboardContent } from 'src/layouts/dashboard';
import { toast } from 'src/components/snackbar';
import { Scrollbar } from 'src/components/scrollbar';
import Typography from '@mui/material/Typography';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import { useTable, TableNoData, TableHeadCustom, TablePaginationCustom } from 'src/components/table';
import { useTheme } from '@emotion/react';
import { Divider, Stack, Grid, MenuItem, IconButton } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { CSVLink } from 'react-csv'; // Import CSVLink
import { OrderTableRow } from '../order-table-row';

const TABLE_HEAD = [
  { id: 'orderNumber', label: 'Select', width: 88 },
  { id: 'orderNumber', label: 'Order', width: 88 },
  { id: 'name', label: 'Customer' },
  { id: 'createdAt', label: 'Date', width: 140 },
  { id: 'total', label: 'Total', width: 120, align: 'center' },
  { id: 'discount', label: 'Discount', width: 120, align: 'center' },
  { id: 'totalAmount', label: 'Price', width: 140 },
  { id: 'paymentmethod', label: 'Payment Method', width: 140 },
  { id: 'actions', label: 'Actions', width: 140 },
];

export function OrderReportListView() {
  const [listData, setListData] = useState([]);
  const [csvData, setCsvData] = useState([]); // Data for CSV export
  const [summaryData, setSummaryData] = useState({});
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTermS, setSearchTermS] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const theme = useTheme();
  const table = useTable({ defaultOrderBy: 'hsn', defaultRowsPerPage: rowsPerPage });

  const getListData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        limit: rowsPerPage,
        offset: page * rowsPerPage,
        month,
        year,
        search: searchTerm || undefined,
      };

      const { data } = await axiosInstance.get('/order-lists/', { params });
      setListData(data.results);
      setTotalRows(data.count);
    } catch (error) {
      toast.error('Error fetching orders');
    }
    setLoading(false);
  }, [rowsPerPage, page, month, year, searchTerm]);

  const getSummaryData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { month, year };
      const { data } = await axiosInstance.get('/order/summary/seller/', { params });
      setSummaryData(data);
    } catch (error) {
      toast.error('Error fetching summary data');
    }
    setLoading(false);
  }, [month, year]);

  const exportToCsv = useCallback(async () => {
    try {
      const params = {
        limit: 10000, // Request up to 10,000 rows
        month,
        year,
        search: searchTerm || undefined,
      };

      const { data } = await axiosInstance.get('/order-lists/', { params });

      // Prepare CSV data
      const headers = ['Order Number', 'Customer Name', 'Date', 'Total', 'Discount', 'Final Price', 'Payment Method'];
      const rows = data.results.map((row) => [
        row.order_number,
        row.customer?.name || 'Anonymous',
        row.created,
        row.total || 0,
        row.total_discount || 0,
        row.final_total || 0,
        row.payment_method || 'N/A',
      ]);

      setCsvData([headers, ...rows]);
      toast.success('Data ready for export!');
    } catch (error) {
      toast.error('Error exporting data');
    }
  }, [month, year, searchTerm]);

  useEffect(() => {
    getListData();
    getSummaryData();
  }, [getListData, getSummaryData]);

  const handlePageChange = (event, newPage) => {
    setListData([]);
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleResetFilters = () => {
    setMonth(new Date().getMonth() + 1);
    setYear(new Date().getFullYear());
    setSearchTerm('');
    setPage(0);
    setSearchTermS('');
  };

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Orders"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Orders', href: paths.dashboard.order.root },
          { name: 'List' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              select
              label="Month"
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              sx={{ width: 150 }}
            >
              {[...Array(12)].map((_, i) => (
                <MenuItem key={i} value={i + 1}>
                  {new Date(0, i).toLocaleString('default', { month: 'long' })}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Year"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              sx={{ width: 150 }}
            >
              {[...Array(5)].map((_, i) => (
                <MenuItem key={i} value={new Date().getFullYear() - i}>
                  {new Date().getFullYear() - i}
                </MenuItem>
              ))}
            </TextField>
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                size="big"
                placeholder="Search..."
                value={searchTermS}
                onChange={(e) => setSearchTermS(e.target.value)}
                variant="outlined"
              />
              <IconButton
                onClick={() => setSearchTerm(searchTermS)}
                color="primary"
                sx={{ p: '10px' }}
                aria-label="search"
              >
                <Iconify icon="solar:magnifer-broken" />
              </IconButton>
            </Stack>
            <Button onClick={handleResetFilters}>Reset Filters</Button>
          </Box>
          <Box>
            <Button variant="contained" onClick={exportToCsv} sx={{ mr: 2 }}>
              Generate CSV
            </Button>
            {csvData.length > 0 && (
              <CSVLink
                data={csvData}
                filename={`order-report-${month}-${year}.csv`}
                style={{ textDecoration: 'none' }}
              >
                <Button variant="contained" color="primary">
                  Download CSV
                </Button>
              </CSVLink>
            )}
          </Box>
        </Box>
        <Scrollbar>
          <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
            <TableHeadCustom headLabel={TABLE_HEAD} />
            <TableBody>
              {loading ? (
                <TableNoData colSpan={TABLE_HEAD.length} />
              ) : (
                listData.map((row) => <OrderTableRow key={row.id} row={row} />)
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
    </DashboardContent>
  );
}