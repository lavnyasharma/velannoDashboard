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
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';
import axiosInstance from 'src/utils/axios';
import { useBoolean } from 'src/hooks/use-boolean';
import { toast } from 'src/components/snackbar';
import { fCurrency } from 'src/utils/format-number';
import { fDate, fTime } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import { capitalizeFirstLetter } from 'src/utils/helper';
import DiscountModalComponent from './order-discount-modal';

// ----------------------------------------------------------------------

export function OrderTableRow({
  row,
  cart = true,
  selected,
  onAdd,
  onViewRow,
  onDeleteRow,
  onDataUpdate
}) {
  const confirm = useBoolean();
  const DiscountModal = useBoolean();

  // Sample discount data

  // Based on the is_diamong value, select the appropriate discount
  const modalTitle = row.is_diamond ? 'Diamond Discount' : 'Silver Discount';
  const collapse = useBoolean();
  const popover = usePopover();


  const handleDiscountClick = () => {
    DiscountModal.onTrue(); // Open the modal
  };

  const handleCloseDiscountModal = () => {
    DiscountModal.onFalse(); // Close the modal
  };
  const renderPrimary = (
    <TableRow hover selected={selected}>
      <TableCell padding="checkbox">
        {/* <Checkbox
          checked={selected}
          onClick={onSelectRow}
          inputProps={{ id: `row-checkbox-${row.hsn}`, 'aria-label': `Row checkbox` }}
        /> */}
        {row.hsn}
      </TableCell>

      <TableCell>
        <Link color="inherit" onClick={onViewRow} underline="always" sx={{ cursor: 'pointer' }}>
          {row.name}
        </Link>
      </TableCell>

      <TableCell>
        <Stack spacing={2} direction="row" alignItems="center">
          {/* <Avatar alt={row.title} src={row.customer.avatarUrl} /> */}

          <Stack
            sx={{
              typography: 'body2',
              flex: '1 1 auto',
              alignItems: 'flex-start',
            }}
          >
            <Box component="span">{row.price}</Box>
            <Box component="span" sx={{ color: 'text.disabled' }}>
              {row.category}
            </Box>
          </Stack>
        </Stack>
      </TableCell>

      <TableCell>
        <ListItemText
          primary={row.collection}
          secondary={`${row.wt}g`}
          primaryTypographyProps={{ typography: 'body2', noWrap: true }}
          secondaryTypographyProps={{
            mt: 0.5,
            component: 'span',
            typography: 'caption',
          }}
        />
      </TableCell>

      <TableCell align="center"> {row.is_diamong ? 'Gold/Diamond' : 'Silver'} </TableCell>

      {/* <TableCell> {fCurrency(row.subtotal)} </TableCell> */}

      <TableCell>
        {/* <Label
          variant="soft"
          color={
            (row.status === 'completed' && 'success') ||
            (row.status === 'pending' && 'warning') ||
            (row.status === 'cancelled' && 'error') ||
            'default'
          }
        >
          {row.status}
        </Label> */}
        {row.size}
      </TableCell>

      <TableCell align="center" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        {cart ? (
          <IconButton
            color={collapse.value ? 'inherit' : 'default'}
            onClick={async () => {
              const resp = axiosInstance
                .post(`/cart/`, {
                  product: row.hsn,
                  quantity: '1',
                })
                .then((res) => {
                  onAdd();
                  toast.success(`item ${row.hsn} added to cart`);
                })
                .catch((error) => {
                  toast.error(error.detail);
                });
            }}
            sx={{ ...(collapse.value && { bgcolor: 'action.hover' }) }}
          >
            <Iconify icon="mynaui:cart-plus-solid" />
          </IconButton>
        ) : (
          <IconButton
            color={popover.open ? 'inherit' : 'default'}
            onClick={() => {
              confirm.onTrue();
              popover.onClose();
            }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        )}
      </TableCell>


      {cart ? (
        null
      ) : (
        <TableCell align="center" sx={{ px: 1, whiteSpace: 'nowrap' }}><IconButton
          color={popover.open ? 'inherit' : 'default'}
          onClick={() => {
            handleDiscountClick()
          }}
        >
          <Iconify icon="streamline:discount-percent-badge-solid" />
        </IconButton></TableCell>
      )}
      {cart ? (
        null
      ) : (
        <TableCell align="center" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          {row.discount ? `${capitalizeFirstLetter(row.discount.title)}-${row.discount.percentage}%` : "no discount"}
        </TableCell>
      )}

    </TableRow>
  );

  // const renderSecondary = (
  //   <TableRow>
  //     <TableCell sx={{ p: 0, border: 'none' }} colSpan={8}>
  //       <Collapse
  //         in={collapse.value}
  //         timeout="auto"
  //         unmountOnExit
  //         sx={{ bgcolor: 'background.neutral' }}
  //       >
  //         <Paper sx={{ m: 1.5 }}>
  //           {row.map((item) => (
  //             <Stack
  //               key={item.id}
  //               direction="row"
  //               alignItems="center"
  //               sx={{
  //                 p: (theme) => theme.spacing(1.5, 2, 1.5, 1.5),
  //                 '&:not(:last-of-type)': {
  //                   borderBottom: (theme) => `solid 2px ${theme.vars.palette.background.neutral}`,
  //                 },
  //               }}
  //             >
  //               <Avatar
  //                 src={item.coverUrl}
  //                 variant="rounded"
  //                 sx={{ width: 48, height: 48, mr: 2 }}
  //               />

  //               <ListItemText
  //                 primary={item.name}
  //                 secondary={item.sku}
  //                 primaryTypographyProps={{ typography: 'body2' }}
  //                 secondaryTypographyProps={{
  //                   component: 'span',
  //                   color: 'text.disabled',
  //                   mt: 0.5,
  //                 }}
  //               />

  //               <div>x{item.quantity} </div>

  //               <Box sx={{ width: 110, textAlign: 'right' }}>{fCurrency(item.price)}</Box>
  //             </Stack>
  //           ))}
  //         </Paper>
  //       </Collapse>
  //     </TableCell>
  //   </TableRow>
  // );

  return (
    <>
      {renderPrimary}

      {/* {renderSecondary} */}

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
        content="Are you sure want to delete?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              onDeleteRow();

              confirm.onFalse()
            }}
          >
            Delete
          </Button>
        }
      />
      <DiscountModalComponent onDiscountUpdate={onDataUpdate} cartItemId={row.id} itemDiscount={row.discount ? row.discount.id : null} is_diamond={row.is_diamond} modalTitle={modalTitle} open={DiscountModal.value} handleCloseDiscountModal={handleCloseDiscountModal} />

    </>
  );
}
