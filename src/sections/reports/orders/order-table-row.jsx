import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import MenuList from '@mui/material/MenuList';
import Collapse from '@mui/material/Collapse';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';

import { fCurrency } from 'src/utils/format-number';
import { fDate, fTime } from 'src/utils/format-time';

import { ConfirmDialog } from 'src/components/custom-dialog';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import { pdf } from '@react-pdf/renderer';
import { InvoicePDF } from './order-pdf-print';

// ----------------------------------------------------------------------
export function OrderTableRow({ row, selected, onViewRow, onSelectRow, onDeleteRow }) {
  const confirm = useBoolean();
  const collapse = useBoolean();
  const popover = usePopover();

  const handlePrint = async (e, invoice) => {
    e.stopPropagation()


    // Generate PDF blob
    const blob = await pdf(<InvoicePDF invoice={invoice} />).toBlob();
    const url = URL.createObjectURL(blob);

    // Create a temporary iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none'; // Hide the iframe
    document.body.appendChild(iframe);

    // Set the source of the iframe to the PDF blob URL
    iframe.src = url;

    // Trigger print when the iframe loads the PDF
    iframe.onload = () => {
      iframe.contentWindow.print();


    };
  }

  const handleRowClick = () => {
    if (collapse.value) {
      collapse.onFalse();
    } else {
      collapse.onTrue();
    }
  };

  const renderPrimary = (
    <TableRow hover selected={selected} onClick={handleRowClick}>
      <TableCell padding="checkbox">
        <Checkbox
          checked={selected}
          onClick={onSelectRow}
          inputProps={{ id: `row-checkbox-${row.order_number}`, 'aria-label': `Row checkbox` }}
        />
      </TableCell>

      <TableCell>
        <Link color="inherit" underline="always" sx={{ cursor: 'pointer' }}>
          {row.order_number}
        </Link>
      </TableCell>

      <TableCell>
        <Stack spacing={2} direction="row" alignItems="center">
          <Stack
            sx={{
              typography: 'body2',
              flex: '1 1 auto',
              alignItems: 'flex-start',
            }}
          >
            <Box component="span">{row.cname ? row.cname : `Anon Customer`}</Box>
            <Box component="span" sx={{ color: 'text.disabled' }}>
              {row.email ? row.email : ''}
            </Box>
          </Stack>
        </Stack>
      </TableCell>

      <TableCell>
        <ListItemText
          primary={fDate(row.created)}
          secondary={fTime(row.created)}
          primaryTypographyProps={{ typography: 'body2', noWrap: true }}
          secondaryTypographyProps={{
            mt: 0.5,
            component: 'span',
            typography: 'caption',
          }}
        />
      </TableCell>

      <TableCell align="center"> {row.items.length} </TableCell>

      <TableCell> {fCurrency(row.items.reduce((acc, item) => acc + item.total, 0))} </TableCell>
      <TableCell> {row.payment_method ? row.payment_method.toUpperCase() : ''} </TableCell>

      {/* Add actions table cell */}
      <TableCell align="center">
        <Tooltip title="Print">
          <IconButton
            onClick={(e) => {
              handlePrint(e, row);
            }}
          >
            <Iconify icon="solar:printer-minimalistic-bold" />
          </IconButton>
        </Tooltip>

      </TableCell>
    </TableRow>
  );

  const renderSecondary = (
    <TableRow>
      <TableCell sx={{ p: 0, border: 'none' }} colSpan={8}>
        <Collapse
          in={collapse.value}
          timeout="auto"
          unmountOnExit
          sx={{ bgcolor: 'background.neutral' }}
        >
          <Paper sx={{ m: 1.5 }}>
            {row.items.map((item) => (
              <Stack
                key={item.id}
                direction="row"
                alignItems="center"
                sx={{
                  p: (theme) => theme.spacing(1.5, 2, 1.5, 1.5),
                  '&:not(:last-of-type)': {
                    borderBottom: (theme) => `solid 2px ${theme.vars.palette.background.neutral}`,
                  },
                }}
              >
                <Box sx={{ width: 110, textAlign: 'center' }}>{item.product.hsn}</Box>
                <Box sx={{ flex: 1 }}>
                  <ListItemText
                    primary={item.product.title}
                    secondary={`${item.product.category}`}
                    primaryTypographyProps={{ typography: 'body2' }}
                    secondaryTypographyProps={{
                      component: 'span',
                      color: 'text.disabled',
                      mt: 0.5,
                      textTransform: 'capitalize',
                    }}
                  />
                </Box>
                <Box sx={{ width: 150, textAlign: 'left' }} textTransform="capitalize">
                  {item.product.collection}
                </Box>

                <Box sx={{ width: 150, textAlign: 'left' }} textTransform="capitalize">
                  {item.product.gross_weight}g
                </Box>
                <Box sx={{ width: 150, textAlign: 'left' }} textTransform="capitalize">
                  {fCurrency(item.product.price)}
                </Box>
                <Box sx={{ width: 150, textAlign: 'left' }} textTransform="capitalize">
                  {item.product.is_diamond ? 'Diamond' : 'Silver'}
                </Box>
              </Stack>
            ))}
          </Paper>
        </Collapse>
      </TableCell>
    </TableRow>
  );

  return (
    <>
      {renderPrimary}
      {renderSecondary}

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <MenuList>
          <MenuItem
            onClick={() => {
              confirm.onTrue();
              popover.onClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            Delete
          </MenuItem>

          <MenuItem
            onClick={() => {
              onViewRow();
              popover.onClose();
            }}
          >
            <Iconify icon="solar:eye-bold" />
            View
          </MenuItem>
        </MenuList>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content="Are you sure you want to delete?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Delete
          </Button>
        }
      />
    </>
  );
}