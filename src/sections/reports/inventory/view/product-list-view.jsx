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
import { RenderCellMaterialProduct, RenderCellProduct } from '../product-table-row';







// API details
const API_URL = '/list-product/user/';
const API_URL_SUMMARY = '/product/summary/seller/';


// ----------------------------------------------------------------------

const HIDE_COLUMNS = { category: false };

// ----------------------------------------------------------------------

export function ProductReportListView() {
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
          qf: filterQuantity, // Pass the filter quantity as a query parameter
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
  }, [sortModel, filterQuantity]); // Add filterQuantity as a dependency


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


        <Select

          value={filterQuantity}
          onChange={handleFilterChange}
          variant="outlined"
          sx={{ mb: 2, width: 200, outline: "none" }} // Style the dropdown
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="available">Available</MenuItem>
          <MenuItem value="sold">Sold</MenuItem>
        </Select>
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
