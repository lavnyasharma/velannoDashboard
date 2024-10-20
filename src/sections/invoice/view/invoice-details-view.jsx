import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { cDiscount } from 'src/utils/format-number';

import { InvoiceDetails } from '../invoice-details';

// ----------------------------------------------------------------------

export function InvoiceDetailsView({ invoice }) {
  function calculateSubtotal(cartItems) {
    return cartItems.reduce((subtotal, item) => {
      const price = parseFloat(item.product.price); // Convert price to a number
      const quantity = item.quantity; // Get the quantity
      return subtotal + price * quantity; // Accumulate the subtotal
    }, 0);
  }

  function calculateDiscountedSubtotal(cartItems) {
    const final =  cartItems.reduce((subtotal, item) => {
      const price = parseFloat(item.product.price); // Convert price to a number
      const quantity = item.quantity; // Get the quantity
      const discount = item.product.is_gold ? cDiscount(JSON.parse(localStorage.getItem("userData")).diamondDiscount) : cDiscount(JSON.parse(localStorage.getItem("userData")).silverDiscount); // 30% for gold, 10% for non-gold
      const discountedPrice = price * (1 - discount); // Apply discount to the price
      return subtotal + discountedPrice * quantity
     
    }, 0);
    const fdiscount = cDiscount(JSON.parse(localStorage.getItem("userData")).fDiscount === '' ? '0' : JSON.parse(localStorage.getItem("userData")).fDiscount)

    if (fdiscount < 1 && fdiscount !== 0) {
      return final - (final * fdiscount)
    }
    return final - fdiscount; // Accumulate the subtotal
  }

  function getTodayDateString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(today.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const invoicess = {
    items: invoice,
    taxes: 3,
    dueDate: getTodayDateString(),

    subtotal: [calculateDiscountedSubtotal(invoice), calculateSubtotal(invoice)],

    createDate: getTodayDateString(),
    totalAmount: calculateSubtotal(invoice),
  };

  return (
    <DashboardContent>
      <InvoiceDetails invoice={invoicess} />
    </DashboardContent>
  );
}
