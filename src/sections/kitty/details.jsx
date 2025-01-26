import { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { DashboardContent } from 'src/layouts/dashboard';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { toast } from 'src/components/snackbar';
import { TablePaginationCustom } from 'src/components/table';
import axiosInstance from 'src/utils/axios';
import { paths } from 'src/routes/paths';
import { Iconify } from 'src/components/iconify';
import { useParams } from 'react-router-dom';

const API_GET_CUSTOMER_KITTY = '/customer_kitty/'; // API endpoint to get customer kitty details

const dummyData = {
  customer: {
    name: 'John Doe',
    phone: '+1234567890',
    email: 'johndoe@example.com',
  },
  scheme: {
    name: 'Premium Scheme',
    monthlyAmount: 5000,
  },
  totalPaid: 25000,
  remainingAmount: 20000,
  startDate: '2023-01-01',
  endDate: '2025-01-01',
  installments: [
    { id: 1, amount: 5000, paid: true, referral: 'Jane Smith' },
    { id: 2, amount: 5000, paid: false, referral: null },
    { id: 3, amount: 5000, paid: true, referral: 'David Johnson' },
    { id: 4, amount: 5000, paid: false, referral: null },
    { id: 5, amount: 5000, paid: true, referral: 'Jane Smith' },
  ],
  referrals: [
    {
      referredCustomer: { name: 'Jane Smith', paidInstallments: 6 },
      paidInstallments: 6,
      isApproved: true,
    },
    {
      referredCustomer: { name: 'David Johnson', paidInstallments: 3 },
      paidInstallments: 3,
      isApproved: false,
    },
  ],
};

export function CustomerKittyDetailView() {
  const { customerId } = useParams(); // Get customer ID from URL
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCustomerKittyDetails = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate the API call with dummy data
      const res = await axiosInstance.get(API_GET_CUSTOMER_KITTY + customerId);
      setCustomerData(res.data);
    } catch (error) {
      toast.error('Error fetching customer kitty details');
    }
    setLoading(false);
  }, [customerId]);

  useEffect(() => {
    fetchCustomerKittyDetails();
  }, [fetchCustomerKittyDetails]);

  if (loading) return <div>Loading...</div>;

  const { customer, scheme, totalPaid, remainingAmount, referrals, installments, startDate, endDate } = dummyData;

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Customer Kitty Details"
        links={[{ name: 'Dashboard', href: paths.dashboard.root }, { name: 'Customer Details' }]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Customer Name"
              value={customer.name}
              variant="outlined"
              disabled
              fullWidth
            />
            <TextField
              label="Phone"
              value={customer.phone}
              variant="outlined"
              disabled
              fullWidth
            />
            <TextField
              label="Email"
              value={customer.email || 'N/A'}
              variant="outlined"
              disabled
              fullWidth
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Month Started"
              value={startDate}
              variant="outlined"
              disabled
              fullWidth
            />
            <TextField
              label="Month Ending"
              value={endDate}
              variant="outlined"
              disabled
              fullWidth
            />
            <TextField
              label="Total Paid"
              value={`₹${totalPaid}`}
              variant="outlined"
              disabled
              fullWidth
            />
            <TextField
              label="Remaining Amount"
              value={`₹${remainingAmount}`}
              variant="outlined"
              disabled
              fullWidth
            />
          </Box>
        </Box>
      </Card>

      {/* Installments Table */}
      <Card sx={{ mb: 3 }}>
        <Scrollbar>
          <Table size="small" sx={{ minWidth: 1050 }}>
            <TableHead>
              <TableRow>
                <TableCell>Month</TableCell>
                <TableCell>Installment Paid</TableCell>
                <TableCell>Referral Details</TableCell>
                <TableCell>Scheme Info</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {installments.map((installment, index) => {
                const isInstallmentPaid = installment.paid;
                const isReferralPaid = installment.referral
                  ? referrals.find((ref) => ref.referredCustomer.name === installment.referral)?.paidInstallments >= 5
                  : false;

                return (
                  <TableRow key={installment.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell
                      sx={{
                        backgroundColor: isInstallmentPaid ? 'green' : 'red',
                        color: 'white',
                      }}
                    >
                      ₹{installment.amount}
                    </TableCell>
                    <TableCell>
                      {installment.referral ? (
                        <span style={{ color: isReferralPaid ? 'green' : 'red' }}>
                          {installment.referral} (Paid {installment.referral ? '5+' : 'Less than 5'} installments)
                        </span>
                      ) : (
                        'No referral'
                      )}
                    </TableCell>
                    <TableCell>{scheme.name} (₹{scheme.monthlyAmount} per month)</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Scrollbar>
      </Card>

      {/* Referral Table */}
      <Card>
        <Scrollbar>
          <Table size="small" sx={{ minWidth: 1050 }}>
            <TableHead>
              <TableRow>
                <TableCell>Referred Customer</TableCell>
                <TableCell>Installments Paid</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {referrals.map((referral) => (
                <TableRow key={referral.referredCustomer.name}>
                  <TableCell>{referral.referredCustomer.name}</TableCell>
                  <TableCell>{referral.paidInstallments}</TableCell>
                  <TableCell>
                    {referral.isApproved ? (
                      <Button variant="contained" color="success">
                        Approved
                      </Button>
                    ) : (
                      <Button variant="contained" color="error">
                        Not Approved
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Scrollbar>
      </Card>
    </DashboardContent>
  );
}
