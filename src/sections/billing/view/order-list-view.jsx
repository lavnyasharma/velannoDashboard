import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { DashboardContent } from 'src/layouts/dashboard';
import { Scrollbar } from 'src/components/scrollbar';
import { Table, TableBody, TableRow, TableCell, Select, FormControl, InputLabel, MenuItem } from '@mui/material';
import { TableHeadCustom } from 'src/components/table';
import { toast } from 'src/components/snackbar';
import axiosInstance from 'src/utils/axios';
import IconButton from '@mui/material/IconButton';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { Iconify } from 'src/components/iconify';
import Modal from '@mui/material/Modal';
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

export function SearchByHsnList() {
  const router = useRouter();
  const [tableData, setTableData] = useState({});
  const [hsnInput, setHsnInput] = useState('');
  const [cart, setCart] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [userData, setUserData] = useState({ name: '', email: '', phone: '' });

  

  const getCartData = async () => {
    const resp = await axiosInstance.get('https://api.velonna.co/cart/').then((res) => {
      console.log(res.data.results);
      setCart(res.data.results);
    });
  };
  const deleteCartItem = async (id) => {
    await axiosInstance.delete(`https://api.velonna.co/cart-item/${id}/`).then((res) => {
      toast.success('Item Removed');
      getCartData()
    });
  };

  useEffect(() => {
    // if (cart.length === 0) {
      getCartData();
    // }
  }, []);

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
        setTableData(data);
        toast.success('Product details fetched successfully!');
      } else {
        const errorResponse = await response.json();
        toast.error('Failed to fetch product details');
      }
    } catch (error) {
      toast.error('Error fetching product details');
    }
  };

  const handleConfirmOrder = () => {
    const savedData = JSON.parse(localStorage.getItem('userData')); 
    if (savedData) {
      setUserData(savedData); // Pre-fill modal fields if data exists
    }
    setOpenModal(true); // Open the modal on Confirm Order click
  };

  const handleOrderSubmission = () => {
    // Save user data to localStorage
    localStorage.setItem('userData', JSON.stringify(userData));

    // Proceed with order submission process
    router.push(paths.dashboard.invoice.details("productinvoice"));
    setOpenModal(false); // Close the modal after submission
    toast.success('Order confirmed!');
  };

  const handleCloseModal = () => {
    setOpenModal(false);
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
                {Object.keys(tableData).length > 0 ? (
                  <OrderTableRow
                    key={tableData.uuid || tableData.hsn}
                    onAdd={getCartData}
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
            <Button color="success" disabled={cart.length===0} onClick={handleConfirmOrder}>
              Confirm Order
            </Button>
          </Box>
          <Scrollbar>
            <Table>
              <TableHeadCustom headLabel={TABLE_HEAD_CART} />
              <TableBody>
                {cart.length > 0 ? (
                  cart.map((item) => (
                    <OrderTableRow
                      key={item.product.hsn}
                      cart={false}
                      onDeleteRow={() => {
                        deleteCartItem(item.id);
                       
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

      {/* Modal for User Info */}
      <Modal open={openModal} onClose={handleCloseModal}>
  <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', p: 4, boxShadow: 24, width: 400 }}>
    <h2>Enter Customer details</h2>
    <TextField
      fullWidth
      margin="normal"
      label="Name"
      value={userData.name}
      onChange={(e) => setUserData({ ...userData, name: e.target.value })}
    />
    <TextField
      fullWidth
      margin="normal"
      label="Email"
      value={userData.email}
      onChange={(e) => setUserData({ ...userData, email: e.target.value })}
    />
    <TextField
      fullWidth
      margin="normal"
      label="Phone Number"
      value={userData.phone}
      onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
    />
    
    <FormControl fullWidth margin="normal">
      <InputLabel>Payment Method</InputLabel>
      <Select
        value={userData.paymentMethod}
        label="Payment Method"
        onChange={(e) => setUserData({ ...userData, paymentMethod: e.target.value })}
      >
        <MenuItem value="upi">UPI</MenuItem>
        <MenuItem value="cash">Cash</MenuItem>
        <MenuItem value="netbanking">Net Banking</MenuItem>
        <MenuItem value="card">Card</MenuItem>
        <MenuItem value="other">Other</MenuItem>
      </Select>
    </FormControl>

    {/* Diamond Discount */}
    <FormControl fullWidth margin="normal">
      <InputLabel>Diamond Discount</InputLabel>
      <Select
        value={userData.diamondDiscount}
        label="Diamond Discount"
        onChange={(e) => setUserData({ ...userData, diamondDiscount: e.target.value })}
      >
        {Array.from({ length: 20 }, (_, i) => (
          <MenuItem key={i} value={`${(i + 1) * 5}%`}>
            {(i + 1) * 5}%
          </MenuItem>
        ))}
      </Select>
    </FormControl>

    {/* Silver Discount */}
    <FormControl fullWidth margin="normal">
      <InputLabel>Silver Discount</InputLabel>
      <Select
        value={userData.silverDiscount}
        label="Silver Discount"
        onChange={(e) => setUserData({ ...userData, silverDiscount: e.target.value })}
      >
        {Array.from({ length: 20 }, (_, i) => (
          <MenuItem key={i} value={`${(i + 1) * 5}%`}>
            {(i + 1) * 5}%
          </MenuItem>
        ))}
      </Select>
    </FormControl>

    {/* F_Discount */}
    <TextField
      fullWidth
      margin="normal"
      label="F Discount"
      value={userData.fDiscount}
      onChange={(e) => setUserData({ ...userData, fDiscount: e.target.value })}
    />

    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
      <Button onClick={handleCloseModal} sx={{ mr: 1 }}>
        Cancel
      </Button>
      <Button variant="contained" onClick={handleOrderSubmission}>
        Submit
      </Button>
    </Box>
  </Box>
</Modal>

    </>
  );
}
