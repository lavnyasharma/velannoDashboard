import { useState, useEffect, useCallback } from 'react';
import axiosInstance from 'src/utils/axios';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select'; // Import Select component
import MenuItem from '@mui/material/MenuItem'; // Import MenuItem component
import {
  DataGrid,
  gridClasses,
  GridActionsCellItem,
  GridExpandMoreIcon,
} from '@mui/x-data-grid';
import CircularProgress from '@mui/material/CircularProgress';
import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';
import { fCurrency } from 'src/utils/format-number';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { DashboardContent } from 'src/layouts/dashboard';
import { useTheme } from '@emotion/react';
import { Accordion, AccordionDetails, AccordionSummary, Box, Divider, Grid, Stack, TextField, Typography } from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';
import { ProductsAnalytic } from '../product-analytics';
import { RenderCellMaterialProduct, RenderCellProduct } from '../product-table-row';
import SummaryCard from '../components/tab';







// API details
const API_URL = '/list-product/user/';
const API_URL_SUMMARY = '/product/summary/seller/';
const API_COUNTERS_URL = '/list/counter/';


// ----------------------------------------------------------------------

const HIDE_COLUMNS = { category: false };

// ----------------------------------------------------------------------

export function ProductListView() {
  const [summaryData, setSummaryData] = useState({})
  const confirmRows = useBoolean();
  const router = useRouter();
  const theme = useTheme();

  const [tableData, setTableData] = useState([]);
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [totalProducts, setTotalProducts] = useState(0);
  const [sortModel, setSortModel] = useState([{ field: 'price', sort: 'asc' }]); // Default sorting
  const [filterQuantity, setFilterQuantity] = useState('all'); // State for filter quantity
  const [selectedcounter, setSelectedcounter] = useState(0);
  const [selectedcategory, setSelectedcategory] = useState(0);
  const [silverselect, setSilverselect] = useState(0);


const [categoriesOptions, setCategoriesOptions] = useState([]);
  useEffect(() => {
    if (localStorage.getItem('role') !== 'admin') return;
    const fetchCounters = async () => {
      try {
        const response = await axiosInstance.get("/category/");
        const categories = response.data.results.map((category) => ({
          label: category.name,
          id: category.id,
        }));
        console.log(categories)
        setCategoriesOptions(categories);
      } catch (error) {
        console.error('Error fetching counters:', error);
      }
    };

    fetchCounters();
  }, []);

  const [counterOptions, setCounterOptions] = useState([]);
  useEffect(() => {
    if (localStorage.getItem('role') !== 'admin') return;
    const fetchCounters = async () => {
      try {
        const response = await axiosInstance.get(API_COUNTERS_URL);
        const counters = response.data.map((counter) => ({
          label: counter.user.username,
          id: counter.user.id,
        }));
        setCounterOptions(counters);
      } catch (error) {
        console.error('Error fetching counters:', error);
      }
    };

    fetchCounters();
  }, []);
  // Fetch products from API
  const fetchProducts = useCallback(async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const offset = (page - 1) * pageSize;
      const ordering = sortModel.length > 0 ?
        `${sortModel[0].sort === 'asc' ? '' : '-'}${sortModel[0].field}` : 'price'; // Sort based on sortModel

      const response = await axiosInstance.get(API_URL, {
        params: {
          ordering,
          limit: pageSize,
          offset,
          qf: filterQuantity,
          category: selectedcategory,
          seller_id: selectedcounter,
          silver_select: silverselect
        },
        headers: {
          accept: 'application/json',

        },
      });
      const { results, count } = response.data;
      setTableData(results);
      setTotalProducts(count);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [sortModel, filterQuantity,selectedcategory,selectedcounter,silverselect]); // Add filterQuantity as a dependency


  const fetchSummary = async () => {
    setLoading(true);
    try {

      const response = await axiosInstance.get(API_URL_SUMMARY, {

        headers: {
          accept: 'application/json',
        },
      });

      setSummaryData(response.data)
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    fetchSummary()
    fetchProducts(paginationModel.page + 1, paginationModel.pageSize);
  }, [fetchProducts, paginationModel]);

  const handleDeleteRow = useCallback(
    (id) => {
      const deleteRow = tableData.filter((row) => row.id !== id);
      toast.success('Delete success!');
      setTableData(deleteRow);
    },
    [tableData]
  );

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.product.edit(id));
    },
    [router]
  );

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.product.details(id));
    },
    [router]
  );

  const handleFilterChange = (event) => {
    setFilterQuantity(event.target.value); // Update the filter quantity state
    setPaginationModel({ page: 0, pageSize: paginationModel.pageSize }); // Reset pagination when filter changes
  };

  const columns = [
    { field: 'hsn', headerName: 'Hsn' },
    {
      field: 'title',
      headerName: 'Product',
      flex: 1,
      minWidth: 360,
      hideable: false,
      renderCell: (params) => (
        <RenderCellProduct params={params} onViewRow={() => handleViewRow(params.row.id)} />
      ),
    },
    {
      field: 'gross_weight',
      headerName: 'Weight',
      width: 160,
      // Sort by number
      sortComparator: (v1, v2) => v1 - v2,
    },
    {
      field: 'collection',
      headerName: 'Collection',
      width: 160,
      // Assuming "collection" is a string, we use localeCompare for sorting
      sortComparator: (v1, v2) => v1.localeCompare(v2),
    },
    {
      field: 'quantity',
      headerName: 'Quantity',
      width: 160,
      // Sort by number
      sortComparator: (v1, v2) => v1 - v2,
    },
    {
      field: 'material',
      headerName: 'Material',
      width: 160,
      renderCell: (params) => (
        <RenderCellMaterialProduct params={params} onViewRow={() => handleViewRow(params.row.id)} />
      ),
      // Assuming "material" is a string, using localeCompare for sorting
      sortComparator: (v1, v2) => v1.localeCompare(v2),
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 140,
      // Sort by number (price)
      sortComparator: (v1, v2) => v1 - v2,
    },
  ];
  return (
    <>
      <DashboardContent sx={{ height: "auto" }}>
        <CustomBreadcrumbs
          heading="List"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Product', href: paths.dashboard.product.root },
            { name: 'List' },
          ]}
          action={localStorage.getItem("role") === "admin" ?
            <Button
              component={RouterLink}
              href={paths.dashboard.product.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              New product
            </Button> : ""
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />
        {!loading ? Object.keys(summaryData).length !== 0 ? (
          <Card sx={{ mb: { xs: 3, md: 5 } }}>
            <Scrollbar sx={{ minHeight: 108 }}>
              <Stack
                direction="row"
                divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
                sx={{ py: 2 }}
              >
                <ProductsAnalytic
                  title="Total"
                  total={summaryData.total_summary.total_assigned}
                  ltotal={summaryData.total_summary.total_left}
                  percent={(((summaryData.total_summary.total_assigned ?? 0) - (summaryData.total_summary.total_left ?? 0)) / (summaryData.total_summary.total_assigned ?? 1)) * 100}
                  weight={summaryData.total_summary.total_weight_left}
                  price={summaryData.total_summary.total_price_left}
                  lweight={summaryData.total_summary.total_weight_assigned}
                  lprice={summaryData.total_summary.total_price_assigned}
                  icon="solar:bill-list-bold-duotone"
                  color={theme.vars.palette.info.main}
                />

                <ProductsAnalytic
                  title="Diamond"
                  total={summaryData.diamond_products.total_assigned}
                  ltotal={summaryData.diamond_products.total_left}
                  percent={(((summaryData.diamond_products.total_assigned ?? 0) - (summaryData.diamond_products.total_left ?? 0)) / (summaryData.diamond_products.total_assigned ?? 1)) * 100}
                  weight={summaryData.diamond_products.total_weight_left}
                  price={summaryData.diamond_products.total_price_left}
                  lweight={summaryData.diamond_products.total_weight_assigned}
                  lprice={summaryData.diamond_products.total_price_assigned}
                  icon="material-symbols:diamond"
                  color={theme.vars.palette.success.main}
                />

                <ProductsAnalytic
                  title="Silver"
                  total={summaryData.silver_products.total_assigned}
                  ltotal={summaryData.silver_products.total_left}
                  percent={(((summaryData.silver_products.total_assigned ?? 0) - (summaryData.silver_products.total_left ?? 0)) / (summaryData.silver_products.total_assigned ?? 1)) * 100}
                  weight={summaryData.silver_products.total_weight_left}
                  price={summaryData.silver_products.total_price_left}
                  lweight={summaryData.silver_products.total_weight_assigned}
                  lprice={summaryData.silver_products.total_price_assigned}
                  icon="mdi:podium-silver"
                  color={theme.vars.palette.warning.main}
                />
              </Stack>
            </Scrollbar>
          </Card>
        ) : (
          <Stack direction="row" justifyContent="center" alignItems="center" sx={{ minHeight: 200 }}>
            <CircularProgress />
          </Stack>
        ) : <Stack direction="row" justifyContent="center" alignItems="center" sx={{ minHeight: 200 }}>
          <CircularProgress />
        </Stack>}

        {!loading ? <Card sx={{ mb: { xs: 3, md: 5 } }}>
          <Accordion defaultExpanded={false}>
            <AccordionSummary
              expandIcon={<GridExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
              sx={{ ml: "40px" }}
            >
              <Typography variant="h5">Category Wise Inventory Details</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Scrollbar sx={{ minHeight: 500 }}>
                <Grid container spacing={3} padding={5}>
                  {summaryData?.category_summary?.map((category) => (
                    <Grid item xs={12} sm={6} md={4} key={category.category__name}>
                      <SummaryCard category={category} />
                    </Grid>
                  ))}
                </Grid>
              </Scrollbar>
            </AccordionDetails>
          </Accordion>
        </Card> : <Stack direction="row" justifyContent="center" alignItems="center" sx={{ minHeight: 200 }}>
          <CircularProgress />
        </Stack>}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Select
          label="Filter Quantity"
          value={filterQuantity}
          onChange={handleFilterChange}
          variant="outlined"
          sx={{ mb: 2, width: 200, outline: "none" }} // Style the dropdown
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="available">Available</MenuItem>
          <MenuItem value="sold">Sold</MenuItem>
        </Select>
        {localStorage.getItem('role') === 'admin' &&
          <TextField
            select
            label="Counter"
            value={selectedcounter}
            onChange={(e) => setSelectedcounter(Number(e.target.value))}
            sx={{ width: 150 }}
          >
            <MenuItem value={0}>
              All
            </MenuItem>
            {counterOptions && counterOptions.map((item, i) => (
              <MenuItem key={i} value={item.id}>
                {item.label}
              </MenuItem>
            ))}
          </TextField>}
          {localStorage.getItem('role') === 'admin' &&
          <TextField
            select
            label="Categories"
            value={selectedcategory}
            onChange={(e) => setSelectedcategory(Number(e.target.value))}
            sx={{ width: 150 }}
          >
            <MenuItem value={0}>
              All
            </MenuItem>
            {categoriesOptions && categoriesOptions.map((item, i) => (
              <MenuItem style={{textTransform:"capitalize"}} key={i} value={item.id}>
                {item.label}
              </MenuItem>
            ))}
          </TextField>}
          {localStorage.getItem('role') === 'admin' &&
          <TextField
            select
            label="Material"
            value={silverselect}
            onChange={(e) => setSilverselect(Number(e.target.value))}
            sx={{ width: 150 }}
          >
            <MenuItem value={-1}>
              All
            </MenuItem>
            <MenuItem value={0}>
              silver
            </MenuItem>
            <MenuItem value={1}>
              diamond
            </MenuItem>
          </TextField>}
          </Box>
        <Card
          sx={{

          }}
        >
          <DataGrid
            checkboxSelection
            disableRowSelectionOnClick
            rows={tableData}
            columns={columns}
            loading={loading}
            pageSize={paginationModel.pageSize}
            rowCount={totalProducts}
            paginationMode="server"
            onPaginationModelChange={setPaginationModel}
            sortModel={sortModel} // Add sort model to DataGrid
            onSortModelChange={setSortModel} // Handle sort model changes
            getRowHeight={() => 'auto'}
            pageSizeOptions={[5, 10, 25]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            sx={{ [`& .${gridClasses.cell}`]: { alignItems: 'center', display: 'flex' } }}
          />
        </Card>
      </DashboardContent>

      <ConfirmDialog
        open={confirmRows.value}
        onClose={confirmRows.off}
        title="Delete Product"
        content="Are you sure you want to delete the selected product?"
        onConfirm={() => {
          selectedRowIds.forEach((id) => handleDeleteRow(id));
          confirmRows.off();
        }}
      />
    </>
  );
}
