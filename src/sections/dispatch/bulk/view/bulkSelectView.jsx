import { useState, useEffect, useCallback } from 'react';
import axiosInstance from 'src/utils/axios';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { DataGrid, gridClasses, GridActionsCellItem } from '@mui/x-data-grid';
import { useRouter } from 'src/routes/hooks';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { DashboardContent } from 'src/layouts/dashboard';
import { useTheme } from '@emotion/react';
import { Autocomplete, IconButton, TextField } from '@mui/material';
import { RenderCellMaterialProduct, RenderCellProduct } from '../product-table-row';

const API_URL = '/list-product/user/';
const API_COUNTERS_URL = '/list/counter/';
const API_UPDATE_COUNTER_URL = '/update/counter/';

export function BulkSelectView() {
  const [tableData, setTableData] = useState([]);
  const [options, setOptions] = useState([]);
  const [counterValues, setCounterValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [totalProducts, setTotalProducts] = useState(0);
  const [hsnSearch, setHsnSearch] = useState('');
  const [sortModel, setSortModel] = useState([{ field: 'price', sort: 'asc' }]);
  const router = useRouter();
  const theme = useTheme();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const productResponse = await axiosInstance.get(API_URL, {
        params: {
          ordering: sortModel.length > 0 ? `${sortModel[0].sort === 'asc' ? '' : '-'}${sortModel[0].field}` : 'price',
          limit: paginationModel.pageSize,
          offset: paginationModel.page * paginationModel.pageSize,
          search: hsnSearch || undefined,
        },
      });
      const products = productResponse.data.results;
      setTableData(products);
      setTotalProducts(productResponse.data.count);

      const counterResponse = await axiosInstance.get(API_COUNTERS_URL);
      const counters = counterResponse.data.map((counter) => ({
        label: counter.user.username,
        id: counter.user.id,
      }));
      setOptions(counters);

      const initialCounterValues = products.reduce((acc, product) => {
        const matchingCounter = counters.find((c) => c.id === product.seller);
        if (matchingCounter) {
          acc[product.id] = matchingCounter;
        }
        return acc;
      }, {});
      setCounterValues(initialCounterValues);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [hsnSearch, paginationModel, sortModel]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateCounter = async (hsn, counterSellerId) => {
    try {
      const response = await axiosInstance.post(API_UPDATE_COUNTER_URL, {
        hsn,
        counter_seller_id: counterSellerId,
      });
      toast.success(response.data.message);  // Show success toast message
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message);  // Show error message
      } else {
        toast.error('An unexpected error occurred.');
      }
    }
  };

  const handleCounterChange = (rowId, newValue) => {
    setCounterValues((prev) => {
      const updatedValues = { ...prev, [rowId]: newValue };

      if (newValue) {
        updateCounter(tableData.find((row) => row.id === rowId).hsn, newValue.id);
      }

      return updatedValues;
    });
  };

  const handleDeleteRow = useCallback(
    (id) => {
      const deleteRow = tableData.filter((row) => row.id !== id);
      toast.success('Delete success!');
      setTableData(deleteRow);
    },
    [tableData]
  );

  const handleViewRow = useCallback(
    (id) => {
      router.push(`/dashboard/product/details/${id}`);
    },
    [router]
  );

  const handleSearch = () => {
    fetchData();
  };

  const columns = [
    { field: 'hsn', headerName: 'HSN', width: 100 },
    {
      field: 'title',
      headerName: 'Product',
      flex: 1,
      renderCell: (params) => (
        <RenderCellProduct params={params} onViewRow={() => handleViewRow(params.row.id)} />
      ),
    },
    { field: 'gross_weight', headerName: 'Weight', width: 120 },
    { field: 'quantity', headerName: 'Quantity', width: 120 },
    {
      field: 'price',
      headerName: 'Price',
      width: 120,
      sortComparator: (v1, v2) => v1 - v2,
    },
    {
      field: 'counter',
      headerName: 'Counter',
      width: 200,
      renderCell: (params) => (
        <Autocomplete
          options={options}
          fullWidth
          value={counterValues[params.row.id] || null}
          onChange={(event, newValue) => handleCounterChange(params.row.id, newValue)}
          renderInput={(parm) => <TextField {...parm} label="Select Counter" variant="outlined" size="small" />}
          sx={{ minWidth: 120 }}
        />
      ),
    },
  ];

  return (
    <DashboardContent>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <TextField
          label="Search HSN"
          value={hsnSearch}
          onChange={(e) => setHsnSearch(e.target.value)}
          variant="outlined"
          sx={{ width: 200 }}
        />
        <IconButton onClick={handleSearch} color="primary">
          <Iconify icon="solar:magnifer-broken" />
        </IconButton>
      </div>
      <Card>
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
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          getRowHeight={() => 'auto'}
          pageSizeOptions={[5, 10, 25]}
          sx={{ [`& .${gridClasses.cell}`]: { alignItems: 'center', display: 'flex' } }}
        />
      </Card>
    </DashboardContent>
  );
}
