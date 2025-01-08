import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { DashboardContent } from 'src/layouts/dashboard';
import { Scrollbar } from 'src/components/scrollbar';
import { Table, TableBody, TableRow, TableCell, Select, FormControl, InputLabel, MenuItem, TableHead, InputAdornment, Chip, CircularProgress } from '@mui/material';
import { TableHeadCustom } from 'src/components/table';
import { toast } from 'src/components/snackbar';
import axiosInstance from 'src/utils/axios';
import IconButton from '@mui/material/IconButton';
import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { Iconify } from 'src/components/iconify';
import Modal from '@mui/material/Modal';
import { useBoolean } from 'src/hooks/use-boolean';
import { capitalizeFirstLetter, formatIndianCurrency } from 'src/utils/helper';
import { ConfirmDialog } from 'src/components/custom-dialog';

import { OrderTableRow } from '../order-table-row'; // Adjust if necessary
import AddCustomerModal from '../order-coustomer-details-modal';
import CouponCodeComponent from '../order-coupon-code';


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
  { id: 'actions', label: 'Actions', width: 88 },
  { id: 'discount', label: 'Discount', width: 88 },
  { id: 'applied discount', label: 'Applied Discount', width: 88 },
];

export function SearchByHsnList() {
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
    birthday: '',
    country: '',
    state: '',
    city: '',
    streetAddress: '',
    postalCode: '',
  });
  const handleDeleteCustomer = () => {
    setCustomerData({
      name: '',
      phone: '',
      email: '',
      birthday: '',
      country: '',
      state: '',
      city: '',
      streetAddress: '',
      postalCode: '',
    });
    localStorage.removeItem('customerData');
  };


  const [orderConfirmLoading, setOrderConfirmLoading] = useState(false);

  const router = useRouter();
  const [tableData, setTableData] = useState({});
  const [hsnInput, setHsnInput] = useState('');
  const [cart, setCart] = useState([]);
  const [roundOff, setRoundOff] = useState(''); // for round off
  const [openModal, setOpenModal] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponCodeDiscount, setCouponCodeDiscount] = useState('');
  const [totalDiscount, setTotalDiscount] = useState();
  const [subtotal, setSubtotal] = useState();
  const [total, setTotal] = useState();

  const [franchiseDiscountType, setFranchiseDiscountType] = useState('fixed');
  const [franchiseDiscount, setFranchiseDiscount] = useState(0)
  const [franchiseAmount, setFranchiseAmount] = useState(0)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [userData, setUserData] = useState({ name: '', email: '', phone: '', fDiscount: '', silverDiscount: '0', diamondDiscount: '0', paymentMethod: '' });
  const collapse = useBoolean();
  const confirm = useBoolean();
  const [salesPersons, setSalesPersons] = useState([]);  // State to store sales person data
  const [selectedSalesPerson, setSelectedSalesPerson] = useState('');  // State to store selected salesperson id

  const onDataUpdate = async () => {
    getCartData()
  }
  useEffect(() => {
    // Function to fetch salesperson data
    const fetchSalesPersons = async () => {
      try {
        const response = await axiosInstance.get(`/salesperson/counter/`, {
        });
        setSalesPersons(response.data);
      } catch (error) {
        console.error('Error fetching salesperson data:', error);
      }
    };

    fetchSalesPersons();  // Fetch salesperson data when the component mounts
  }, []);




  const handleApplyCoupon = (event) => {

  }
  // Function to handle salesperson selection
  const handleSalesPersonChange = async (event) => {
    setSelectedSalesPerson(event.target.value);
    try {
      // Send the put request to update the cart franchise discount
      await axiosInstance.put(`cart/update/`,
        {
          salesperson: event.target.value
        });
      if (onDataUpdate) {
        onDataUpdate();
      }
    } catch (error) {
      console.error('Error updating franchise discount for cart:', error);
    }
  };
  const calculateDiscount = (type) => {
    const totalPrice = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    if (type === 'diamond') {
      const discountPercentage = parseInt(userData.diamondDiscount, 10);
      return (totalPrice * discountPercentage) / 100;
    }
    const discountPercentage = parseInt(userData.silverDiscount, 10);
    return (totalPrice * discountPercentage) / 100;


  };

  // Function to calculate the total price after applying discounts
  const calculateTotal = () => {
    const totalPrice = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const diamondDiscount = calculateDiscount('diamond');
    const silverDiscount = calculateDiscount('silver');
    const fDiscount = parseInt(userData.fDiscount || 0, 10);

    const totalAfterDiscount = totalPrice - diamondDiscount - silverDiscount - fDiscount;
    return totalAfterDiscount >= 0 ? totalAfterDiscount.toFixed(2) : 0; // Ensure the total doesn't go negative
  };

  const getCartData = async () => {
    const resp = await axiosInstance.get(`/cart/details/`).then((res) => {
      const data = res.data
      setCart(data.cart_item);
      setTotalDiscount(data.total_discount)
      setSubtotal(data.final_total)
      setTotal(data.total)
      setFranchiseDiscount(data.franchise_discount)
      setFranchiseDiscountType(data.franchise_discount_type)
      setRoundOff(data.roundoff)
      setFranchiseAmount(data.franchise_discount_amount)
      setSelectedSalesPerson(data.salesperson ? data.salesperson : "")
      setPaymentMethod(data.payment_method)
      setCustomerData(data.customer ? {
        id: data.customer.id,
        name: data.customer.name,
        phone: data.customer.phone,
        email: data.customer.email,
        birthday: data.customer.birthday,
        country: data.customer.country,
        state: data.customer.state,
        city: data.customer.city,
        streetAddress: data.customer.streetAddress,
        postalCode: data.customer.postal_code,
      } : {
        name: '',
        phone: '',
        email: '',
        birthday: '',
        country: '',
        state: '',
        city: '',
        streetAddress: '',
        postalCode: '',
      })
      setCouponCode(data.applied_coupons)
      setCouponCodeDiscount(data.coupon_discount)
      if (data.info_message !== "") {
        toast.success(data.info_message)
      }
    }).catch((e) => {
      toast(e.error)
    })
  };
  const deleteCartItem = async (id) => {
    await axiosInstance.delete(`/cart-item/${id}/`).then((res) => {
      toast.success('Item Removed');
      getCartData()
    });
  };

  useEffect(() => {
    // if (cart.length === 0) {
    getCartData();
    // }
  }, [setCart]);

  const handleSearchByHsn = async () => {
    try {
      const response = await axiosInstance.get(`/product/${hsnInput}/details`);
      const data = response.data;
      console.log(response);
      setTableData(data);
      toast.success('Product details fetched successfully!');
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error('Product not found!');
      }
    }
  };

  const handleConfirmOrder = async () => {
    setOrderConfirmLoading(true); // Set loading to true
    try {
      const response = await axiosInstance.post(`/confirm/order/`);
      router.push(paths.dashboard.invoice.details(response.data.order_number));
      toast.success('Order confirmed successfully!');
    } catch (error) {
      toast.error(`Failed! ${error.response?.data?.message || 'Error confirming order'}`);
    } finally {
      setOrderConfirmLoading(false); // Reset loading to false
    }
  };


  const handleFranchiseDiscountChange = async (event) => {
    if (franchiseDiscount > 15 && franchiseDiscountType === 'percentage') {
      toast.error("Value cannot be greater that 15%")
      setFranchiseDiscount(0)
    }

    try {
      // Send the put request to update the cart franchise discount
      await axiosInstance.put(`cart/update/`,
        {
          franchise_discount: Number(franchiseDiscount) > 0 && ((franchiseDiscount < 15 && franchiseDiscountType === 'percentage') || franchiseDiscountType === 'fixed') ? franchiseDiscount : 0,
          franchise_discount_type: franchiseDiscountType
        });
      if (onDataUpdate) {
        onDataUpdate();
      }
    } catch (error) {
      console.error('Error updating franchise discount for cart:', error);
    }
  };

  const handlePaymentMethodChange = async (data) => {


    try {
      // Send the put request to update the cart franchise discount
      await axiosInstance.put(`cart/update/`,
        {
          payment_method: data
        });
      if (onDataUpdate) {
        onDataUpdate();
      }
    } catch (error) {
      console.error('Error updating franchise discount for cart:', error);
    }
  };

  const handleRoundOffChange = async (event) => {
    const roundoffmaxfig = 500

    if (roundOff > roundoffmaxfig) {
      setRoundOff(0)
      toast.error(`Round off cannot be greater than ${formatIndianCurrency(roundoffmaxfig)}`)
    }
    try {
      // Send the put request to update the cart franchise discount
      await axiosInstance.put(`cart/update/`,
        {
          roundoff: Number(roundOff) > 0 && roundOff <= roundoffmaxfig ? roundOff : 0
        });
      if (onDataUpdate) {
        onDataUpdate();
      }
    } catch (error) {
      console.error('Error updating franchise discount for cart:', error);
    }
  };

  const handleOrderSubmission = () => {
    // Proceed with order submission process
    // router.push(paths.dashboard.invoice.details("productinvoice"));
    // setOpenModal(false); // Close the modal after submission
    // toast.success('Order confirmed!');
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <>
      <DashboardContent sx={{ flexDirection: "row", flexGrow: 1, justifyContent: "space-around", }}>
        {orderConfirmLoading && <div style={{ position: 'fixed', backgroundColor: 'rgba(0, 0, 0, 0.5)', width: '100%', height: '100%', top: 0, left: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <h1>Processing Order...</h1>
          <CircularProgress />
        </div>}

        <div style={{ width: "55%" }}> <Card>
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
                {tableData && Object.keys(tableData).length > 0 ? (
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
              <Button color="success" disabled={cart.length === 0} onClick={() => {
                confirm.onTrue();
              }}>
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
                        onDataUpdate={onDataUpdate}
                        row={{
                          id: item.id,
                          discount: item.discount,
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
        </div>
        <div style={{ width: "40%" }}>
          <Card>
            <Box sx={{ p: 2 }}>
              <h2 style={{ marginTop: 0 }}>Summary</h2>

              {cart.length > 0 ? (
                <Table>

                  <TableBody>
                    {/* Render Cart Items */}
                    {/* {cart.map((item) => (
                      <TableRow key={item.product.hsn}>
                        <TableCell>{item.product.title}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">{item.product.price}</TableCell>
                        <TableCell align="right">{item.product.price * item.quantity}</TableCell>
                      </TableRow>
                    ))} */}

                    {/* Render Discounts */}
                    <TableRow>
                      <TableCell colSpan={3} align="left">Total </TableCell>
                      <TableCell align="right">{formatIndianCurrency(total)}</TableCell>
                    </TableRow>
                    {Number(totalDiscount) > 0 ? <TableRow>
                      <TableCell colSpan={3} align="left">Total Discount </TableCell>
                      <TableCell align="right">- {formatIndianCurrency(totalDiscount)}</TableCell>
                    </TableRow> : null}
                    {Number(couponCodeDiscount) > 0 ? <TableRow>
                      <TableCell colSpan={3} align="left">{`Coupon Discount(${couponCode ? couponCode.code : ""})`} </TableCell>
                      <TableCell align="right">- {formatIndianCurrency(couponCodeDiscount)}</TableCell>
                    </TableRow> : null}
                    {Number(franchiseDiscount) > 0 ? <TableRow>
                      <TableCell colSpan={3} align="left">Franchise Discount </TableCell>
                      <TableCell align="right">- {formatIndianCurrency(franchiseAmount)}</TableCell>
                    </TableRow> : null}
                    {Number(roundOff) > 0 ? <TableRow>
                      <TableCell colSpan={3} align="left">Round Off </TableCell>
                      <TableCell align="right">- {formatIndianCurrency(roundOff)}</TableCell>
                    </TableRow> : null}


                    {/* Render Total Price */}
                    <TableRow>
                      <TableCell colSpan={3} align="left" style={{ fontWeight: 'bold' }}>Subtotal</TableCell>
                      <TableCell align="right" style={{ fontWeight: 'bold' }}>
                        {formatIndianCurrency(subtotal)}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              ) : (
                <span>No items in the cart</span>
              )}
            </Box>
          </Card>
          <Box sx={{ p: 2 }} />
          <Card sx={{ p: 3 }}>
            <h3 style={{ marginTop: 0 }}>Bill Details</h3>
            <Box sx={{ maxHeight: 400, overflowY: 'auto' }}> {/* Scrollable Box */}
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Detail</strong></TableCell>
                    <TableCell><strong>Action</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Salesperson row */}
                  <TableRow>
                    <TableCell>Salesperson</TableCell>
                    <TableCell>
                      <FormControl fullWidth>
                        <InputLabel>Salesperson</InputLabel>
                        <Select
                          value={selectedSalesPerson}
                          onChange={handleSalesPersonChange}
                          label="Salesperson"
                        >
                          {salesPersons.map((salesPerson) => (
                            <MenuItem key={salesPerson.id} value={salesPerson.id}>
                              {`${capitalizeFirstLetter(salesPerson.profile.user.first_name)} ${capitalizeFirstLetter(salesPerson.profile.user.last_name)} - ${capitalizeFirstLetter(salesPerson.designation)}`}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>

                  {/* Customer row */}
                  <TableRow>
                    <TableCell>Customer</TableCell>
                    <TableCell>
                      {customerData.name && customerData.phone ? (
                        <Chip
                          onClick={() => collapse.onTrue()}
                          label={customerData.name}
                          onDelete={handleDeleteCustomer}
                          variant="outlined"
                        />
                      ) : (
                        <Button variant="outlined" onClick={() => { collapse.onTrue() }}>
                          Add Customer
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>

                  {/* Round Off row */}
                  <TableRow>
                    <TableCell>Round Off</TableCell>
                    <TableCell>
                      <TextField
                        label="Round Off"
                        value={roundOff}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleRoundOffChange(e);
                          }
                        }}
                        onChange={(e) => setRoundOff(e.target.value)}
                        fullWidth
                        type="number"
                        InputProps={{ inputProps: { min: 0 } }}
                      />
                    </TableCell>
                  </TableRow>

                  {/* Franchise Discount row */}
                  <TableRow>
                    <TableCell>Franchise Discount</TableCell>
                    <TableCell>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <TextField
                          label="Franchise Discount"
                          value={franchiseDiscount}
                          onChange={(e) => setFranchiseDiscount(e.target.value)}
                          fullWidth
                          type="number"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleFranchiseDiscountChange(e);
                            }
                          }}
                          InputProps={{
                            inputProps: { min: 0 },
                            startAdornment: (
                              <InputAdornment position="start">
                                {franchiseDiscountType === 'fixed' ? '₹' : '%'}
                              </InputAdornment>
                            ),
                          }}
                        />
                        <Select
                          value={franchiseDiscountType}
                          onChange={(e) => setFranchiseDiscountType(e.target.value)}
                          style={{ marginLeft: '10px' }}
                        >
                          <MenuItem value="fixed">Fixed</MenuItem>
                          <MenuItem value="percentage">Percentage</MenuItem>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>

                  {/* Apply Coupon row */}
                  <CouponCodeComponent disable={totalDiscount > 0} couponData={couponCodeDiscount > 0 ? couponCode : null} onDataUpdate={onDataUpdate} />

                  {/* Payment Method and Details */}
                  <TableRow>
                    <TableCell>Payment Method</TableCell>
                    <TableCell>
                      <FormControl fullWidth margin="normal">
                        <InputLabel>Payment Method</InputLabel>
                        <Select
                          required
                          value={paymentMethod}
                          label="Payment Method"
                          onChange={(e) => {
                            setPaymentMethod(e.target.value)
                            handlePaymentMethodChange(e.target.value)
                          }}
                        >
                          <MenuItem value="upi">UPI</MenuItem>
                          <MenuItem value="cash">Cash</MenuItem>
                          <MenuItem value="netbanking">Net Banking</MenuItem>
                          <MenuItem value="card">Card</MenuItem>
                          <MenuItem value="other">Other</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>



                </TableBody>
              </Table>
            </Box>
          </Card>

        </div>

      </DashboardContent >

      {/* Modal for User Info */}
      < Modal open={openModal} onClose={handleCloseModal} >
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: 'background.paper', p: 4, boxShadow: 24, width: 400 }}>
          <h2>Billing details</h2>
          <TextField
            fullWidth
            margin="normal"
            label="Name"
            required
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
            required
            value={userData.phone}
            onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={paymentMethod}
              label="Payment Method"
              onChange={(e) => {
                setPaymentMethod(e.target.value)
                handlePaymentMethodChange()
              }}
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
              required

              value={userData.diamondDiscount}
              label="Diamond Discount"
              onChange={(e) => setUserData({ ...userData, diamondDiscount: e.target.value === '' ? '0' : e.target.value })}
            >
              {Array.from({ length: 31 }, (_, i) => (
                <MenuItem key={i} value={`${(i)}%`}>
                  {(i)}%
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Silver Discount */}
          <FormControl fullWidth margin="normal">
            <InputLabel>Silver Discount</InputLabel>
            <Select
              required

              value={userData.silverDiscount}
              label="Silver Discount"
              onChange={(e) => setUserData({ ...userData, silverDiscount: e.target.value === '' ? '0' : e.target.value })}
            >
              {Array.from({ length: 31 }, (_, i) => (
                <MenuItem key={i} value={`${(i)}%`}>
                  {(i)}%
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
            onChange={(e) => setUserData({ ...userData, fDiscount: e.target.value === '' ? '' : e.target.value })}
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
      </Modal >

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Close Order"
        content="Done With Billing? Close Order?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={async () => {
              if (!orderConfirmLoading) {
                await handleConfirmOrder();
              }
            }}
            disabled={orderConfirmLoading} // Disable button while loading
          >
            {orderConfirmLoading ? 'Processing...' : 'Close Order'}
          </Button>
        }
      />
      <AddCustomerModal customerData={customerData} setCustomerData={setCustomerData} open={collapse.value} onClose={() => {
        collapse.onFalse()
      }} />
    </>
  );
}
