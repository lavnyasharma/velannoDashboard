import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { InvoiceDetails } from '../invoice-details';

// ----------------------------------------------------------------------

export function InvoiceDetailsView({ invoice }) {
  function calculateSubtotal (cartItems) {
    return cartItems.reduce((subtotal, item) => {
      const price = parseFloat(item.product.price); // Convert price to a number
      const quantity = item.quantity; // Get the quantity
      return subtotal + price * quantity; // Accumulate the subtotal
    }, 0);
  };

  function getTodayDateString  (){
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const invoicess = {
    items: invoice,
    taxes: 100,
    dueDate: getTodayDateString(),

    subtotal: calculateSubtotal(invoice),

    createDate: getTodayDateString(),
    totalAmount: calculateSubtotal(invoice),
  };

  return (
    <DashboardContent>
      <InvoiceDetails invoice={invoicess} />
    </DashboardContent>
  );
}
