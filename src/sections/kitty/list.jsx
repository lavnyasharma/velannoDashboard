import { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { DashboardContent } from 'src/layouts/dashboard';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { toast } from 'src/components/snackbar';
import { TablePaginationCustom } from 'src/components/table';
import axiosInstance from 'src/utils/axios';
import { paths } from 'src/routes/paths';
import { Iconify } from 'src/components/iconify';

const API_LIST_CUSTOMERS = '/customers/';

export function CustomerListView() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTerm, setFilteredTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRows, setTotalRows] = useState(0);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        limit: rowsPerPage,
        offset: page * rowsPerPage,
        search: filteredTerm || undefined,
      };

      const { data } = await axiosInstance.get(API_LIST_CUSTOMERS, { params });
      setCustomers(data.results);
      setTotalRows(data.count);
    } catch (error) {
      toast.error('Error fetching customers');
    }
    setLoading(false);
  }, [rowsPerPage, page, filteredTerm]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSearch = () => {
    setFilteredTerm(searchTerm);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilteredTerm('');
    setPage(0);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Customers"
        links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Customers' }]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              size="small"
              placeholder="Search by Name or Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              variant="outlined"
            />
            <IconButton onClick={handleSearch} color="primary" aria-label="search">
              <Iconify icon="solar:magnifer-broken" />
            </IconButton>
            <Button onClick={handleResetFilters}>Reset Filters</Button>
          </Box>
        </Box>
      </Card>

      <Card>
        <Scrollbar>
          <Table size="small" sx={{ minWidth: 1050 }}>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Months Paid</TableCell>
                <TableCell>Months Left</TableCell>
                <TableCell>Referrals</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : customers.length > 0 ? (
                customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.email || 'N/A'}</TableCell>
                    <TableCell>{customer.address || 'N/A'}</TableCell>
                    <TableCell>{customer.monthsPaid || 'N/A'}</TableCell>
                    <TableCell>{customer.monthsLeft || 'N/A'}</TableCell>
                    <TableCell>{customer.referrals || 'N/A'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No customers found.
                  </TableCell>
                </TableRow>
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
