import { useState, useCallback, useRef } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import { styled } from '@mui/material/styles';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';

import { fDate } from 'src/utils/format-time';
import { cDiscount, fCurrency } from 'src/utils/format-number';

import { INVOICE_STATUS_OPTIONS } from 'src/_mock';

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { Button } from '@mui/material';

import { InvoiceToolbar } from './invoice-toolbar';

// ----------------------------------------------------------------------

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  [`& .${tableCellClasses.root}`]: {
    textAlign: 'right',
    borderBottom: 'none',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
}));

// ----------------------------------------------------------------------

export function InvoiceDetails({ invoice }) {
  const [currentStatus, setCurrentStatus] = useState(invoice?.status);

  const handleChangeStatus = useCallback((event) => {
    setCurrentStatus(event.target.value);
  }, []);
  const cardRef = useRef();

  const renderTotal = (
    <>
      <StyledTableRow>
        <TableCell colSpan={3} />
        <TableCell sx={{ color: 'text.secondary' }}>
          <Box sx={{ mt: 2 }} />
          Subtotal
        </TableCell>
        <TableCell width={120} sx={{ typography: 'subtitle2' }}>
          <Box sx={{ mt: 2 }} />
          {fCurrency(invoice?.subtotal)}
        </TableCell>
      </StyledTableRow>

      {invoice.f_discount !== "0%" && (
        <StyledTableRow>
          <TableCell colSpan={3} />
          <TableCell sx={{ color: 'text.secondary' }}>Additional</TableCell>
          <TableCell width={120} sx={{ color: 'error.main', typography: 'body2' }}>
            {invoice.f_discount.includes("%")
              ? `-${invoice.f_discount}`
              : `-${fCurrency(cDiscount(invoice.f_discount))}`}
          </TableCell>
        </StyledTableRow>
      )}

      <StyledTableRow>
        <TableCell colSpan={3} />
        <TableCell sx={{ color: 'text.secondary' }}>Franchise Discount</TableCell>
        <TableCell width={120} sx={{ color: 'error.main', typography: 'body2' }}>
          {`-${fCurrency(invoice.franchise_discount_amount)}`}
        </TableCell>
      </StyledTableRow>

      <StyledTableRow>
        <TableCell colSpan={3} />
        <TableCell sx={{ typography: 'subtitle1' }}>Final Total</TableCell>
        <TableCell width={140} sx={{ typography: 'subtitle1' }}>
          {fCurrency(invoice.final_total)}
        </TableCell>
      </StyledTableRow>
    </>
  );

  const renderFooter = (
    <Box gap={2} display="flex" alignItems="center" flexWrap="wrap" sx={{ py: 3 }}>
      <div>
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
          NOTES
        </Typography>
        <Typography variant="body2">We appreciate your purchase</Typography>
      </div>

      <Box flexGrow={{ md: 1 }} sx={{ textAlign: { md: 'right' } }}>
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
          Have a question?
        </Typography>
        <Typography variant="body2">info@velonna.co</Typography>
      </Box>
    </Box>
  );

  const renderList = (
    <Scrollbar sx={{ mt: 5 }}>
      <Table sx={{ minWidth: 960 }}>
        <TableHead>
          <TableRow>
            <TableCell width={40}>#</TableCell>
            <TableCell sx={{ typography: 'subtitle2' }}>Description</TableCell>
            <TableCell>Qty</TableCell>
            <TableCell align="right">Unit price</TableCell>
            <TableCell align="right">Discount</TableCell>
            <TableCell align="right">Total</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {invoice.order_items.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                <Box sx={{ maxWidth: 560 }}>
                  <Typography variant="subtitle2">{item.product.title}</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
                    {`${item.product.gross_weight}g`}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell align="right">{fCurrency(item.product.price)}</TableCell>
              <TableCell align="right">
                {item.product.is_gold
                  ? invoice.diamond_discount
                  : invoice.silver_discount}
              </TableCell>
              <TableCell align="right">
                {fCurrency(
                  item.total -
                    item.total * cDiscount(
                      item.product.is_gold
                        ? invoice.diamond_discount
                        : invoice.silver_discount
                    )
                )}
              </TableCell>
            </TableRow>
          ))}

          {renderTotal}
        </TableBody>
      </Table>
    </Scrollbar>
  );

  return (
    <>
      <InvoiceToolbar
        invoice={invoice}
        currentStatus={currentStatus || ''}
        onChangeStatus={handleChangeStatus}
        statusOptions={INVOICE_STATUS_OPTIONS}
      />

      <Card sx={{ pt: 5, px: 5 }} ref={cardRef}>
        <Box
          rowGap={5}
          display="grid"
          alignItems="center"
          gridTemplateColumns={{ xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' }}
        >
          <Box
            component="img"
            alt="logo"
            src="/logo/logo-full.svg"
            sx={{ width: 120, height: 100 }}
          />

          <Stack spacing={1} alignItems={{ xs: 'flex-start', md: 'flex-end' }}>
            <Typography variant="h6">{invoice.order_number}</Typography>
          </Stack>

          <Stack sx={{ typography: 'body2' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Estimate from
            </Typography>
            Velonna.co
            <br />
            info@velonna.co
            <br />
            contact: contact@velonna.co
            <br />
          </Stack>

          <Stack sx={{ typography: 'body2' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Estimate to
            </Typography>
            {invoice.customer?invoice.customer.name:invoice.cname}
            <br />
            {invoice.customer?invoice.customer.email:invoice.email}
            <br />
            Phone: {invoice.customer?invoice.customer.phone:invoice.phone}
            <br />
          </Stack>

          <Stack sx={{ typography: 'body2' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Date create
            </Typography>
            {fDate(invoice.created)}
          </Stack>

          <Stack sx={{ typography: 'body2' }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Due date
            </Typography>
            {fDate(invoice.due_date)}
          </Stack>
        </Box>

        {renderList}

        <Divider sx={{ mt: 5, borderStyle: 'dashed' }} />

        {renderFooter}
      </Card>
    </>
  );
}
