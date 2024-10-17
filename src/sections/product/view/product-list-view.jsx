import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import {
  DataGrid,
  gridClasses,
  GridActionsCellItem,
} from '@mui/x-data-grid';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { DashboardContent } from 'src/layouts/dashboard';
import { RenderCellMaterialProduct, RenderCellProduct } from '../product-table-row';

// API details
const API_URL = 'https://api.velonna.co/list/product/';
const CSRF_TOKEN = 'nm9iD0EBxWmfYJfYyu7Q8zqAU6TLHqoUafu69uaEzAugYHKfuhBVXA8BrBZlhbbY';

// ----------------------------------------------------------------------

const HIDE_COLUMNS = { category: false };

// ----------------------------------------------------------------------

export function ProductListView() {
  const confirmRows = useBoolean();
  const router = useRouter();

  const [tableData, setTableData] = useState([]);
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [totalProducts, setTotalProducts] = useState(0);
  const [sortModel, setSortModel] = useState([{ field: 'price', sort: 'asc' }]); // Default sorting

  // Fetch products from API
  const fetchProducts = useCallback(async (page = 1, pageSize = 10) => {
    setLoading(true);
    try {
      const offset = (page - 1) * pageSize;
      const ordering = sortModel.length > 0 ? 
        `${sortModel[0].sort === 'asc' ? '' : '-'}${sortModel[0].field}` : 'price'; // Sort based on sortModel

      const response = await axios.get(API_URL, {
        params: {
          ordering,
          limit: pageSize,
          offset,
        },
        headers: {
          accept: 'application/json',
          'X-CSRFToken': CSRF_TOKEN,
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
  }, [sortModel]); // Add sortModel as a dependency

  useEffect(() => {
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

  const columns = [
    { field: 'hsn', headerName: 'Hsn', filterable: false },
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
      // Sort by date
      sortComparator: (v1, v2) => new Date(v1) - new Date(v2),
    },
    {
      field: 'collection',
      headerName: 'Collection',
      width: 160,
      // Sort by date
      sortComparator: (v1, v2) => new Date(v1) - new Date(v2),
    },
    {
      field: 'quantity',
      headerName: 'Quantity',
      width: 160,
      // Sort by date
      sortComparator: (v1, v2) => new Date(v1) - new Date(v2),
    },
    {
      field: 'material',
      headerName: 'Material',
      width: 160,
      renderCell: (params) => (
        <RenderCellMaterialProduct params={params} onViewRow={() => handleViewRow(params.row.id)} />
      ),
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 140,
      // Sort by price
      sortComparator: (v1, v2) => v1 - v2,
    },
    {
      type: 'actions',
      field: 'actions',
      headerName: ' ',
      align: 'right',
      headerAlign: 'right',
      width: 80,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      getActions: (params) => [
        <GridActionsCellItem
          showInMenu
          icon={<Iconify icon="solar:eye-bold" />}
          label="View"
          onClick={() => handleViewRow(params.row.id)}
        />,
        // <GridActionsCellItem
        //   showInMenu
        //   icon={<Iconify icon="solar:pen-bold" />}
        //   label="Edit"
        //   onClick={() => handleEditRow(params.row.id)}
        // />,
        // <GridActionsCellItem
        //   showInMenu
        //   icon={<Iconify icon="solar:trash-bin-trash-bold" />}
        //   label="Delete"
        //   onClick={() => handleDeleteRow(params.row.id)}
        //   sx={{ color: 'error.main' }}
        // />,
      ],
    },
  ];

  return (
    <>
      <DashboardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <CustomBreadcrumbs
          heading="List"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Product', href: paths.dashboard.product.root },
            { name: 'List' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.product.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              New product
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card
          sx={{
            flexGrow: { md: 1 },
            display: { md: 'flex' },
            height: { xs: 800, md: 2 },
            flexDirection: { md: 'column' },
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
            sx={{ [`& .${gridClasses.cell}`]: { alignItems: 'center', display: 'inline-flex' } }}
          />
        </Card>
      </DashboardContent>

      <ConfirmDialog
        open={confirmRows.value}
        onClose={confirmRows.onFalse}
        title="Delete"
        content={
          <>
            Are you sure you want to delete <strong>{selectedRowIds.length}</strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              // Handle multiple row deletion
              confirmRows.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}
