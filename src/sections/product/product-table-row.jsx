import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import LinearProgress from '@mui/material/LinearProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';

import { fCurrency } from 'src/utils/format-number';
import { fTime, fDate } from 'src/utils/format-time';
import { Label } from 'src/components/label';

// ----------------------------------------------------------------------

export function RenderCellPrice({ params }) {
  return fCurrency(params.row.price);
}

// ----------------------------------------------------------------------

export function RenderCellPublish({ params }) {
  return (
    <Label variant="soft" color={(params.row.publish === 'published' && 'info') || 'default'}>
      {params.row.publish}
    </Label>
  );
}

// ----------------------------------------------------------------------

export function RenderCellCreatedAt({ params }) {
  return (
    <Stack spacing={0.5}>
      <Box component="span">{fDate(params.row.createdAt)}</Box>
      <Box component="span" sx={{ typography: 'caption', color: 'text.secondary' }}>
        {/* {fTime(params.row.createdAt)} */}
      </Box>
    </Stack>
  );
}

// ----------------------------------------------------------------------

export function RenderCellStock({ params }) {
  return (
    <Stack justifyContent="center" sx={{ typography: 'caption', color: 'text.secondary' }}>
      <LinearProgress
        value={(params.row.available * 100) / params.row.quantity}
        variant="determinate"
        color={
          (params.row.inventoryType === 'out of stock' && 'error') ||
          (params.row.inventoryType === 'low stock' && 'warning') ||
          'success'
        }
        sx={{ mb: 1, width: 1, height: 6, maxWidth: 80 }}
      />
      {!!params.row.available && params.row.available} {params.row.inventoryType}
    </Stack>
  );
}

// ----------------------------------------------------------------------

export function RenderCellProduct({ params, onViewRow }) {
  const [open, setOpen] = useState(false);

  const handleAvatarClick = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Stack direction="row" alignItems="center" sx={{ py: 2, width: 1 }}>
        <Avatar
          alt={params.row.name}
          src={params.row.stock_photo}
          variant="rounded"
          sx={{ width: 64, height: 64, mr: 2, cursor: 'pointer' }}
          onClick={handleAvatarClick} // Open modal on avatar click
        />

        <ListItemText
          disableTypography
          primary={
            <Link
              noWrap
              color="inherit"
              variant="subtitle2"
              onClick={onViewRow}
              sx={{ cursor: 'pointer', textTransform: 'uppercase' }}
            >
              {params.row.title}
            </Link>
          }
          secondary={
            <Box component="div" sx={{ typography: 'body2', color: 'text.disabled' }}>
              {params.row.category}
            </Box>
          }
          sx={{ display: 'flex', flexDirection: 'column' }}
        />
      </Stack>

      {/* Modal for displaying the image */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogContent>
          <img
            src={params.row.stock_photo}
            alt={params.row.name}
            style={{ width: '100%', height: 'auto' }} // Adjust as necessary
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

// ----------------------------------------------------------------------

export function RenderCellMaterialProduct({ params, onViewRow }) {
  const [open, setOpen] = useState(false);

  const handleAvatarClick = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Stack direction="row" alignItems="center" sx={{ py: 2, width: 1 }}>
        <ListItemText
          disableTypography
          primary={
            <Link
              noWrap
              color="inherit"
              variant="subtitle2"
              onClick={onViewRow}
              sx={{ cursor: 'pointer' }}
            >
              {params.row.is_diamond ? "Diamond/Gold" : "Silver"}
            </Link>
          }
          sx={{ display: 'flex', flexDirection: 'column' }}
        />
      </Stack>

      {/* Modal for displaying the image */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogContent>
          <img
            src={params.row.stock_photo} // Use stock photo or appropriate image
            alt={params.row.name}
            style={{ width: '100%', height: 'auto' }} // Adjust as necessary
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
