import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { DashboardContent } from 'src/layouts/dashboard';
import { Scrollbar } from 'src/components/scrollbar';
import { Table, TableBody, TableRow, TableCell } from '@mui/material';
import { TableHeadCustom } from 'src/components/table';
import { toast } from 'src/components/snackbar';
import axiosInstance from 'src/utils/axios';
import IconButton from '@mui/material/IconButton';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { Iconify } from 'src/components/iconify';


import { OrderTableRow } from '../order-table-row'; // Adjust if necessary

const TABLE_HEAD = [
  { id: 'hsn', label: 'HSN', width: 88 },
  { id: 'name', label: 'Name' },
  { id: 'price', label: 'Price', width: 140 },
  { id: 'collection', label: 'Collection' },
  { id: 'material', label: 'Material' },
  { id: 'size', label: 'Size' },
  { id: 'actions', label: 'actions', width: 88 },
];


const TABLE_HEAD_CART = [
  { id: 'hsn', label: 'HSN', width: 88 },
  { id: 'name', label: 'Name' },
  { id: 'price', label: 'Price', width: 140 },
  { id: 'weight', label: 'Weight' },
  { id: 'material', label: 'Material' },
  { id: 'size', label: 'Size' },
  { id: 'actions', label: 'actions', width: 88 },
];

// ----------------------------------------------------------------------

export function SearchByHsnList() {

  const router = useRouter();
  const [tableData, setTableData] = useState({}); // Initialize with an empty array
  const [hsnInput, setHsnInput] = useState('');
  const [cart, setCart] = useState([]);

  const deleteCartItem = async (id) => {
    const resp = await axiosInstance.delete(`https://api.velonna.co/cart-item/${id}/`).then((res)=>{
      toast.success(`Item Removed`)
    })
  };
  

  const getCartData = async () => {
    const resp = await axiosInstance.get('https://api.velonna.co/cart/').then((res) => {
      console.log(res.data.results);
      setCart(res.data.results);
    });
  };
  useEffect(() => {
    if (cart.length === 0) {
      getCartData();
    }
  }, [cart]);
  const handleSearchByHsn = async () => {
    try {
      const response = await fetch(`https://api.velonna.co/product/${hsnInput}/details`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data); // Inspect the structure of the fetched data

        // If the API returns a single product, make it an array for rendering
        setTableData(data);
        toast.success('Product details fetched successfully!');
      } else {
        const errorResponse = await response.json();
        console.error('Error response:', errorResponse);
        toast.error('Failed to fetch product details');
      }
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Error fetching product details');
    }
  };

  return (
    <>
      <DashboardContent>
        <Card>
          <Box sx={{ p: 2 }}>
            <TextField
              label="Search by HSN"
              value={hsnInput}
              onChange={(e) => setHsnInput(e.target.value)}
              variant="outlined"
              size="small"
              sx={{ width: '250px', mr: 1 }}
            />
            <Button variant="contained" onClick={handleSearchByHsn}>
              Search
            </Button>
          </Box>

          <Scrollbar>
            <Table>
              <TableHeadCustom headLabel={TABLE_HEAD} />
              <TableBody>
                {Object.keys(tableData).length > 0 ? ( // Check if there are any rows to render
                  <OrderTableRow
                    key={tableData.uuid || tableData.hsn} // Use uuid or hsn as key if uuid is missing
                    row={{
                      hsn: tableData.hsn,
                      price: tableData.price,
                      category: tableData.category,
                      collection: tableData.collection,
                      name: tableData.title,
                      wt: tableData.gross_weight,
                      is_diamond: tableData.is_diamond,
                      size: tableData.size,
                    }}
                  />
                ) : (
                  <TableRow>
                    <TableCell colSpan={TABLE_HEAD.length} style={{ textAlign: 'center' }}>
                      No products found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Scrollbar>
        </Card>
        <Box sx={{ p: 2 }} />
        <Card>
          <Box sx={{ p: 2 }} width="100%" display="flex" justifyContent="space-between">
            <span>Current Cart</span>
            <Button
              color='success'
              onClick={() => {
              //  http://localhost:3000/dashboard/invoice/e99f09a7-dd88-49d5-b1c8-1daf80c2d7b2
              router.push(paths.dashboard.invoice.details("productinvoice")
              )

              }}
            >
              Confirm Order
            </Button>
          </Box>
          <Scrollbar>
            <Table>
              <TableHeadCustom headLabel={TABLE_HEAD_CART} />
              <TableBody>
                {cart.length > 0 ? ( // Check if there are any rows to render
                  cart.map((item) => (
                    <OrderTableRow
                      key={item.product.hsn} // Use uuid or hsn as key if uuid is missing
                      cart={false}
                      onDeleteRow={()=>{
                        deleteCartItem(item.id)
                      }}
                      row={{
                        hsn: item.product.hsn,
                        price: item.product.price,
                        category: item.product.category,
                        name: item.product.title,
                        wt: item.product.gross_weight,
                        is_diamond: item.product.is_diamond,
                        size: item.product.size,
                      }}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={TABLE_HEAD.length} style={{ textAlign: 'center' }}>
                      No products in cart
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Scrollbar>
        </Card>
      </DashboardContent>
    </>
  );
}
