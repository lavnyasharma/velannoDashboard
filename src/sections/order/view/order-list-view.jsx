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
import Typography from '@mui/material/Typography';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import {
  useTable,
  TableNoData,
  TableHeadCustom,
  TablePaginationCustom,
} from 'src/components/table';
import { useTheme } from '@emotion/react';
import { LoadingIcon } from 'yet-another-react-lightbox';
import { Divider, Stack, Grid } from '@mui/material';
import { GridExpandMoreIcon } from '@mui/x-data-grid';
import { OrderTableRow } from '../order-table-row';
import { OrderAnalytic } from '../order-analytics';

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

export function OrderListView() {
  const [term, setTerm] = useState('')
  const [listData, setListData] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // Added search term state
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
        search: searchTerm || undefined, // Include search term in the params
      };

      const { data } = await axiosInstance.get('https://api.velonna.co/order-lists/', { params });
      setListData(data.results);
      setTotalRows(data.count);
    } catch (error) {
      toast.error('Error fetching orders');
    }
    setLoading(false);
  }, [startDate, endDate, searchTerm]); // Add searchTerm to the dependencies

  const getSummaryData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      };

      const { data } = await axiosInstance.get('https://api.velonna.co/order/summary/seller/', { params });
      console.log(data);
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
    setListData([])
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
    setSearchTerm(''); // Reset the search term
    setPage(0);
    setTerm('')
  };

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.order.details(id));
    },
    [router]
  );

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="List"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Order', href: paths.dashboard.order.root },
          { name: 'List' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {Object.keys(summaryData).length !== 0 ? (
        <Card sx={{ mb: { xs: 3, md: 5 } }}>
          <Scrollbar sx={{ minHeight: 108 }}>
            <Stack
              direction="row"
              divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
              sx={{ py: 2 }}
            >
              <OrderAnalytic
                title="Total"
                total={summaryData?.total_sales_summary?.total_quantity}
                percent={(((summaryData?.total_products ?? 0) - (summaryData?.total_sales_summary?.total_quantity ?? 0)) / (summaryData?.total_products ?? 1)) * 100}
                weight={summaryData?.total_sales_summary?.total_weight}
                price={summaryData?.total_sales_summary?.total_price}
                icon="solar:bill-list-bold-duotone"
                color={theme.vars.palette.info.main}
              />

              <OrderAnalytic
                title="Diamond"
                total={summaryData?.diamond_sales?.total_sales}
                percent={(((summaryData?.total_diamond ?? 0) - (summaryData?.diamond_sales?.total_sales ?? 0)) / (summaryData?.total_diamond ?? 1)) * 100}
                weight={summaryData?.diamond_sales?.total_weight}
                price={summaryData?.diamond_sales?.total_price}
                icon="material-symbols:diamond"
                color={theme.vars.palette.success.main}
              />

              <OrderAnalytic
                title="Silver"
                total={summaryData?.silver_sales?.total_sales}
                percent={(((summaryData?.total_silver ?? 0) - (summaryData?.silver_sales?.total_sales ?? 0)) / (summaryData?.total_silver ?? 1)) * 100}
                weight={summaryData?.silver_sales?.total_weight}
                price={summaryData?.silver_sales?.total_price}
                icon="mdi:podium-silver"
                color={theme.vars.palette.warning.main}
              />
            </Stack>
          </Scrollbar>
        </Card>
      ) : (
        ''
      )}

      <Card sx={{ mb: { xs: 3, md: 5 } }}>
        <Accordion defaultExpanded={false}>
          <AccordionSummary
            expandIcon={<GridExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography variant="h6">Category wise Sales</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Scrollbar sx={{ minHeight: 500 }}>
              <Grid container spacing={3} padding={5}>
                {summaryData?.category_sales?.map((category) => (
                  <Grid item xs={12} sm={6} md={4} key={category.product__category__name}>
                    <Card>
                      <Box sx={{ p: 2 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          {category.product__category__name.charAt(0).toUpperCase() + category.product__category__name.slice(1)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Total Sold:</strong> {category.total_sold}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Total Price:</strong> ₹{category.total_price.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Total Weight:</strong> {category.total_weight}g
                        </Typography>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Scrollbar>
          </AccordionDetails>
        </Accordion>
      </Card>

      <Card>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              label="Search"
              value={term}
              onChange={(e)=>{
                setTerm(e.target.value)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setSearchTerm(term);
                  setPage(0); // Reset to the first page on search
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
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => handleDateChange(e, false)}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <Button onClick={handleResetFilters}>Reset Filters</Button>
          </Box>
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
