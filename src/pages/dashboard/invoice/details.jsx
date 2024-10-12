import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';
import { _invoices } from 'src/_mock/_invoice';

import { InvoiceDetailsView } from 'src/sections/invoice/view';
import { useEffect, useState } from 'react';
import axiosInstance from 'src/utils/axios';

// ----------------------------------------------------------------------

const metadata = { title: `Invoice details | Dashboard - ${CONFIG.appName}` };

export default function Page() {
  const { id = '' } = useParams();
  const getCartData = async () => {
    const resp = await axiosInstance.get('https://api.velonna.co/cart/').then((res) => {
      console.log(res.data.results);
      setCart(res.data.results);
    });
  };
  const [cart,setCart] = useState([])
  useEffect(()=>{
    if (cart.length===0){
      getCartData()
    }
  })

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

    {cart.length===0?"Genratign invoice":  <InvoiceDetailsView invoice={cart} />}
    </>
  );
}
