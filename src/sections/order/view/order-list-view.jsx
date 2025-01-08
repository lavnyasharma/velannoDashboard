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
import { Divider, Stack, Grid, MenuItem, CardContent, IconButton } from '@mui/material';
import { GridExpandMoreIcon } from '@mui/x-data-grid';
import { Iconify } from 'src/components/iconify';
import { OrderTableRow } from '../order-table-row';
import { OrderAnalytic } from '../order-analytics';

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

const SummaryCard = ({ summaryData }) => {
  const { total_discount, total_roundoff, total_franchise_discount } = summaryData?.total_summary || {};

  return (
    <Card sx={{ mb: { xs: 3, md: 5 }, p: 2, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
          Summary Overview
        </Typography>
        <Grid container spacing={3} direction="row" alignItems="center">
          {/* Total Discount */}
          <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                p: 2,
                borderRadius: 2,
                width: "100%",
              }}
            >
              <Iconify
                icon="mdi:discount-circle"
                sx={{
                  fontSize: 100,
                  color: "red",
                  mr: 2,
                }}
              />
              <Box>
                <Typography variant="subtitle1" sx={{ fontSize:12, fontWeight: "bold" }}>
                  Total Discount
                </Typography>
                <Typography variant="h6" sx={{ color: "red" }}>
                  ₹{total_discount || 0}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Total Roundoff */}
          <Grid item xs={12} sm={4} sx={{ fontSize:12, fontWeight: "bold" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                p: 2,
                borderRadius: 2,
                width: "100%",
              }}
            >
              <Iconify
                icon="mdi:adjust"
                sx={{
                  fontSize: 40,
                  color: "#007bff",
                  mr: 2,
                }}
              />
              <Box>
                <Typography variant="subtitle1" sx={{ fontSize:12, fontWeight: "bold"}}>
                  Total Roundoff
                </Typography>
                <Typography variant="h6" sx={{ color: "#007bff" }}>
                  ₹{total_roundoff || 0}
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Total Franchise Discount */}
          <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                p: 2,
                borderRadius: 2,
                width: "100%",
              }}
            >
              <Iconify
                icon="mdi:store"
                sx={{
                  fontSize: 40,
                  color: "green",
                  mr: 2,
                }}
              />
              <Box>
                <Typography variant="subtitle1" sx={{ fontSize:12, fontWeight: "bold" }}>
                  Franchise Discount
                </Typography>
                <Typography variant="h6" sx={{ color: "green" }}>
                  ₹{total_franchise_discount || 0}
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};


export function OrderListView() {
  const [listData, setListData] = useState([]);
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
    setListData([]);
    try {
      const params = {
        limit: rowsPerPage,
        offset: page * rowsPerPage,
        month,
        year,
        search: searchTerm || undefined,
      };

      const { data } = await axiosInstance.get('/order-lists/', { params }).finally(() => setLoading(false));
      setListData(data.results);
      setTotalRows(data.count);
    } catch (error) {
      toast.error('Error fetching orders');
    }
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
    setMonth("");
    setYear("");
    setSearchTerm('');
    setPage(0);
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
                total={summaryData?.total_orders}
                percent={(((summaryData?.total_products ?? 0) - (summaryData?.total_summary?.total_quantity ?? 0)) / (summaryData?.total_products ?? 1)) * 100}
                weight={(summaryData?.diamond_sales?.total_weight ?? 0) + (summaryData?.silver_sales?.total_weight ?? 0)}
                price={summaryData?.total_summary?.total_price}
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

      <SummaryCard summaryData={summaryData} />

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
              {[...Array(2)].map((_, i) => (
                <MenuItem key={i} value={new Date().getFullYear() - i}>
                  {new Date().getFullYear() - i}
                </MenuItem>
              ))}
            </TextField>
            <Stack direction="row" spacing={1} alignItems="center" >
              <TextField
                size="big"
                placeholder="Search..."
                value={searchTermS}
                onChange={(e) => {
                  setSearchTermS(e.target.value)
                }}
                variant="outlined"
              />
              <IconButton
                onClick={() => {
                  setSearchTerm(searchTermS)
                }}
                color="primary"
                sx={{ p: '10px' }}
                aria-label="search"
              >
                <Iconify icon="solar:magnifer-broken" />
              </IconButton>
            </Stack>
            <Button onClick={handleResetFilters}>Reset Filters</Button>
          </Box>
        </Box>
        <Scrollbar>
          <Table size='small' sx={{ minWidth: 1050 }}>
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
