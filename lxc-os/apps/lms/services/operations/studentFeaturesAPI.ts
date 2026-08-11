import { toast } from 'react-hot-toast';

import { resetCart } from '../../lib/state/slices/cart-slice';
import { setPaymentLoading } from '../../lib/state/slices/course-slice';
import { apiConnector } from '../../lib/api/api-connector';
import { studentEndpoints } from '../../lib/api/apis';

const { COURSE_PAYMENT_API, COURSE_VERIFY_API, SEND_PAYMENT_SUCCESS_EMAIL_API } = studentEndpoints;

function loadScript(src: string) {
  return new Promise<boolean>((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

type NavigateLike =
  | ((path: string) => void)
  | {
      push: (path: string) => unknown;
    };

function go(navigate: NavigateLike, path: string) {
  if (typeof navigate === 'function') return navigate(path);
  return navigate.push(path);
}

export async function BuyCourse(
  token: string,
  courses: string[],
  user_details: { firstName?: string; lastName?: string; email?: string },
  navigate: NavigateLike,
  dispatch: any,
) {
  const toastId = toast.loading('Loading...');
  try {
    const ok = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!ok) {
      toast.error('Razorpay SDK failed to load. Check your Internet Connection.');
      return;
    }

    const orderResponse = await apiConnector<any>(
      'POST',
      COURSE_PAYMENT_API,
      { courses },
      { Authorization: `Bearer ${token}` },
    );

    if (!orderResponse.data?.success) {
      throw new Error(orderResponse.data?.message || 'Could not create payment order');
    }

    const data = orderResponse.data.data;

    const key =
      // Prefer Next.js client-safe env var name
      (process.env.NEXT_PUBLIC_RAZORPAY_KEY as string | undefined) ??
      // Keep legacy fallback
      (process.env.RAZORPAY_KEY as string | undefined);

    const options = {
      key,
      currency: data.currency,
      amount: `${data.amount}`,
      order_id: data.id,
      name: 'LXC-LMS',
      description: 'Thank you for Purchasing the Course.',
      prefill: {
        name: `${user_details.firstName ?? ''} ${user_details.lastName ?? ''}`.trim(),
        email: user_details.email,
      },
      handler: function (response: any) {
        sendPaymentSuccessEmail(response, data.amount, token);
        verifyPayment({ ...response, courses }, token, navigate, dispatch);
      },
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const RazorpayCtor = (window as any).Razorpay;
    if (!RazorpayCtor) {
      toast.error('Razorpay is not available on window.');
      return;
    }

    const paymentObject = new RazorpayCtor(options);
    paymentObject.open();
    paymentObject.on('payment.failed', function (response: any) {
      toast.error('Oops! Payment Failed.');
      // eslint-disable-next-line no-console
      console.log(response?.error);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('PAYMENT API ERROR............', error);
    toast.error('Could Not make Payment.');
  } finally {
    toast.dismiss(toastId);
  }
}

async function verifyPayment(
  bodyData: any,
  token: string,
  navigate: NavigateLike,
  dispatch: any,
) {
  const toastId = toast.loading('Verifying Payment...');
  dispatch(setPaymentLoading(true));
  try {
    const response = await apiConnector<any>('POST', COURSE_VERIFY_API, bodyData, {
      Authorization: `Bearer ${token}`,
    });

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Payment verification failed');
    }

    toast.success('Payment Successful. You are Added to the course ');
    go(navigate, '/dashboard/enrolled-courses');
    dispatch(resetCart());
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('PAYMENT VERIFY ERROR............', error);
    toast.error('Could Not Verify Payment.');
  } finally {
    toast.dismiss(toastId);
    dispatch(setPaymentLoading(false));
  }
}

async function sendPaymentSuccessEmail(response: any, amount: number, token: string) {
  try {
    await apiConnector(
      'POST',
      SEND_PAYMENT_SUCCESS_EMAIL_API,
      {
        orderId: response.razorpay_order_id,
        paymentId: response.razorpay_payment_id,
        amount,
      },
      { Authorization: `Bearer ${token}` },
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log('PAYMENT SUCCESS EMAIL ERROR............', error);
  }
}

