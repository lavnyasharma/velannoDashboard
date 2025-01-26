import { useState, useCallback } from 'react';
import { Box, Button, Card, TextField, Stack, Typography, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, Collapse, FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import { toast } from 'src/components/snackbar';
import axiosInstance from 'src/utils/axios';
import { Iconify } from 'src/components/iconify';

const API_SEARCH_CUSTOMER = 'kitty/search/customer/';
const API_ADD_CUSTOMER = '/customer/add/';
const API_START_SCHEME = '/scheme/start/';

export function SearchAddCustomerView() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [customerData, setCustomerData] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '' });
  const [showTerms, setShowTerms] = useState(false);
  const [schemeData, setSchemeData] = useState({
    name: '',
    monthlyAmount: '',
    duration: 10, // Fixed to 10 months
    bonusMonths: 1, // Fixed to 1 bonus month
  });

  const handleSearchCustomer = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get(API_SEARCH_CUSTOMER, {
        params: { phone: phoneNumber },
      });
      if (data) {
        setCustomerData(data);
      } else {
        toast.info('Customer not found. You can add a new customer.');
      }
    } catch (error) {
        console.error(error.response.data.detail);
        setCustomerData(null);
      toast.error(error.response.data.detail || 'Error searching customer.');
    }
  }, [phoneNumber]);

  const handleAddCustomer = async () => {
    try {
      const { data } = await axiosInstance.post(API_ADD_CUSTOMER, newCustomer);
      toast.success('Customer added successfully!');
      setCustomerData(data);
      setIsAdding(false);
    } catch (error) {
      toast.error('Error adding customer.');
    }
  };

  const handleStartScheme = async () => {
    try {
      // Dummy API call to start the scheme for the selected customer
      const { data } = await axiosInstance.post(API_START_SCHEME, {
        customerId: customerData.id,
        ...schemeData,
      });
      toast.success('Scheme started successfully!');
    } catch (error) {
      toast.error('Error starting the scheme.');
    }
  };

  return (
    <Card sx={{ p: 3, maxWidth: 800, margin: 'auto', boxShadow: 3 }}>
      <Typography variant="h5" gutterBottom align="center">
        Search or Add Customer
      </Typography>

      <Stack direction="row" spacing={2} alignItems="center" mb={3}>
        <TextField
          label="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          variant="outlined"
          fullWidth
        />
        <IconButton color="primary" onClick={handleSearchCustomer}>
          <Iconify icon="solar:magnifer-broken" />
        </IconButton>
      </Stack>

      {customerData ? (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6">Customer Details</Typography>
          <Typography>Name: {customerData.name}</Typography>
          <Typography>Email: {customerData.email}</Typography>
          <Typography>Phone: {customerData.phone}</Typography>
        </Box>
      ) : (
        <Box sx={{ textAlign: 'center' }}>
          <Button variant="outlined" onClick={() => setIsAdding(true)}>
            Add New Customer
          </Button>
        </Box>
      )}

      <Dialog open={isAdding} onClose={() => setIsAdding(false)}>
        <DialogTitle>Add Customer</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <TextField
              label="Name"
              value={newCustomer.name}
              onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
              variant="outlined"
              fullWidth
            />
            <TextField
              label="Email"
              value={newCustomer.email}
              onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
              variant="outlined"
              fullWidth
            />
            <TextField
              label="Phone"
              value={phoneNumber}
              variant="outlined"
              fullWidth
              disabled
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAdding(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddCustomer}>
            Add Customer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Scheme Section */}
      {customerData && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Start Scheme for {customerData.name} for 10 months
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Monthly Amount</InputLabel>
            <Select
              value={schemeData.monthlyAmount}
              onChange={(e) => setSchemeData({ ...schemeData, monthlyAmount: e.target.value })}
              disabled={!customerData}
              label="Monthly amount"
            >
              <MenuItem value={5000}>5000</MenuItem>
              <MenuItem value={10000}>10000</MenuItem>
            </Select>
            <FormHelperText>Select the monthly amount</FormHelperText>
          </FormControl>

          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleStartScheme}
              disabled={!customerData || !schemeData.monthlyAmount}
            >
              Start Scheme
            </Button>
          </Box>
        </Box>
      )}

      {/* Terms and Conditions */}
      <Box sx={{ mt: 3 }}>
        <Button variant="text" onClick={() => setShowTerms(!showTerms)}>
          {showTerms ? 'Hide Terms & Conditions' : 'View Terms & Conditions'}
        </Button>
        <Collapse in={showTerms}>
          <Card sx={{ p: 2, mt: 2, boxShadow: 1 }}>
            <Typography variant="h6">Terms and Conditions</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              1. You have enrolled in Velonna monthly installment plan.<br />
              2. This scheme is only valid on diamond jewellery.<br />
              3. This scheme is non-transferable and non-refundable in any case.<br />
              4. Members have to pay for 10 months and avail the benefit of the 11th month.<br />
              5. Instalment Date - (1st to 10th of every month).<br />
              6. Payment of instalment can be made by any mode of payment.<br />
              7. No Credit/Benefits will be given on higher purchases.<br />
              8. In case of late payment of any instalment, member will not get the benefit of the 11th month.<br />
              9. GST as applicable.<br />
              10. In case of loss of passbook, duplicate passbook will be issued on the payment of Rs. 500/-<br />
              11. All disputes are subject to Jammu Jurisdiction.<br />
              12. The company reserves the right to withdraw the scheme anytime without any prior notice.<br />
            </Typography>
          </Card>
        </Collapse>
      </Box>
    </Card>
  );
}
