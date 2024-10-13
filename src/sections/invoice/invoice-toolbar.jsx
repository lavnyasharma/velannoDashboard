import { useCallback } from 'react';
import { PDFViewer, PDFDownloadLink, pdf } from '@react-pdf/renderer';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import NoSsr from '@mui/material/NoSsr';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import axiosInstance from 'src/utils/axios';
import { ConfirmDialog } from 'src/components/custom-dialog';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { toast } from 'src/components/snackbar';

import { InvoicePDF } from './invoice-pdf';

// ----------------------------------------------------------------------

export function InvoiceToolbar({ invoice, currentStatus, statusOptions, onChangeStatus }) {
  const router = useRouter();
  const confirm = useBoolean();
  const view = useBoolean();

  const handleEdit = useCallback(() => {
    router.push(paths.dashboard.invoice.edit(`${invoice?.id}`));
  }, [invoice?.id, router]);


  const closeOrder = async () =>{
    const resp = await axiosInstance
      .post('https://api.velonna.co/order/counter/', {
        name: localStorage.getItem('userData')?JSON.parse(localStorage.getItem('userData')).name?JSON.parse(localStorage.getItem('userData')).name:"":"",
        email: localStorage.getItem('userData')?JSON.parse(localStorage.getItem('userData')).email?JSON.parse(localStorage.getItem('userData')).email:"":"",
        phone: localStorage.getItem('userData')?JSON.parse(localStorage.getItem('userData')).phone?JSON.parse(localStorage.getItem('userData')).phone:"":"",
      })
      .then(async (res) => {
        toast.success('Order Created');
        localStorage.removeItem('userData');
        router.push(paths.dashboard.search.root)
      })
      .catch((error) => {
        toast.error(`some thing went wrong ${String(error)} Please Contact administrator`);
      });
  }
  const handlePrint = useCallback(async () => {
    
        if (!invoice) return;

        // Generate PDF blob
        const blob = await pdf(<InvoicePDF invoice={invoice} />).toBlob();
        const url = URL.createObjectURL(blob);

        // Create a temporary iframe for printing
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none'; // Hide the iframe
        document.body.appendChild(iframe);

        // Set the source of the iframe to the PDF blob URL
        iframe.src = url;
        console.log(url);

        // Trigger print when the iframe loads the PDF
        iframe.onload = () => {
          iframe.contentWindow.print();

          confirm.onTrue();
        };
  }, [invoice,confirm]);
  const renderDownload = (
    <NoSsr>
      <PDFDownloadLink
        document={invoice ? <InvoicePDF invoice={invoice} /> : <span />}
        fileName={invoice?.invoiceNumber}
        style={{ textDecoration: 'none' }}
      >
        {({ loading }) => (
          <Tooltip title="Download">
            <IconButton>
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                <Iconify icon="eva:cloud-download-fill" />
              )}
            </IconButton>
          </Tooltip>
        )}
      </PDFDownloadLink>


      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Close Order"
        content="Done With Billing? Close Order?"
        action={
          <Button variant="contained" color="error" onClick={async ()=>{
            closeOrder()
          }}>
            Close Order
          </Button>
        }
      />
    </NoSsr>
  );

  return (
    <>
      <Stack
        spacing={3}
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-end', sm: 'center' }}
        sx={{ mb: { xs: 3, md: 5 } }}
      >
        <Stack direction="row" spacing={1} flexGrow={1} sx={{ width: 1 }}>
          {/* <Tooltip title="Edit">
            <IconButton onClick={handleEdit}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip> */}

          {/* <Tooltip title="View">
            <IconButton onClick={view.onTrue}>
              <Iconify icon="solar:eye-bold" />
            </IconButton>
          </Tooltip> */}

          {renderDownload}

          <Tooltip title="Print">
            <IconButton
              onClick={() => {
                handlePrint();
              }}
            >
              <Iconify icon="solar:printer-minimalistic-bold" />
            </IconButton>
          </Tooltip>

          {/* <Tooltip title="Send">
            <IconButton>
              <Iconify icon="iconamoon:send-fill" />
            </IconButton>
          </Tooltip> */}

          {/* <Tooltip title="Share">
            <IconButton>
              <Iconify icon="solar:share-bold" />
            </IconButton>
          </Tooltip> */}
        </Stack>

        <TextField
          fullWidth
          select
          label="Status"
          value={currentStatus}
          onChange={onChangeStatus}
          inputProps={{ id: `status-select-label` }}
          InputLabelProps={{ htmlFor: `status-select-label` }}
          sx={{ maxWidth: 160 }}
        >
          {statusOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <Dialog fullScreen open={view.value}>
        <Box sx={{ height: 1, display: 'flex', flexDirection: 'column' }}>
          <DialogActions sx={{ p: 1.5 }}>
            <Button color="inherit" variant="contained" onClick={view.onFalse}>
              Close
            </Button>
          </DialogActions>

          <Box sx={{ flexGrow: 1, height: 1, overflow: 'hidden' }}>
            <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
              {invoice && <InvoicePDF invoice={invoice} currentStatus={currentStatus} />}
            </PDFViewer>
          </Box>
        </Box>
      </Dialog>
    </>
  );
}
