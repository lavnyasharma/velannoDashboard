// core (MUI)
import {
  frFR as frFRCore,
  viVN as viVNCore,
  zhCN as zhCNCore,
  arSA as arSACore,
} from '@mui/material/locale';
// date pickers (MUI)
import {
  enUS as enUSDate,
  frFR as frFRDate,
  viVN as viVNDate,
  zhCN as zhCNDate,
} from '@mui/x-date-pickers/locales';
// data grid (MUI)
import {
  enUS as enUSDataGrid,
  frFR as frFRDataGrid,
  viVN as viVNDataGrid,
  zhCN as zhCNDataGrid,
  arSD as arSDDataGrid,
} from '@mui/x-data-grid/locales';

// ----------------------------------------------------------------------

export const allLangs = [
  {
    value: 'en',
    label: 'English',
    countryCode: 'IN',
    adapterLocale: 'en',
    numberFormat: { code: 'en-in', currency: 'INR' },
    systemValue: {
      components: { ...enUSDate.components, ...enUSDataGrid.components },
    },
  },
  
];

/**
 * Country code:
 * https://flagcdn.com/en/codes.json
 *
 * Number format code:
 * https://gist.github.com/raushankrjha/d1c7e35cf87e69aa8b4208a8171a8416
 */
