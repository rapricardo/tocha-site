const ASAAS_BASE_URL = import.meta.env.ASAAS_API_KEY?.startsWith('$aact_')
  ? 'https://sandbox.asaas.com/api/v3'
  : 'https://api.asaas.com/v3';

const ASAAS_API_KEY = import.meta.env.ASAAS_API_KEY;

if (!ASAAS_API_KEY) {
  throw new Error('ASAAS_API_KEY é obrigatória');
}

async function asaasFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${ASAAS_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      access_token: ASAAS_API_KEY,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Asaas API error (${res.status}): ${error}`);
  }

  return res.json();
}

export async function findOrCreateCustomer(email: string, name: string): Promise<string> {
  const search = await asaasFetch(`/customers?email=${encodeURIComponent(email)}`);

  if (search.data && search.data.length > 0) {
    return search.data[0].id;
  }

  const customer = await asaasFetch('/customers', {
    method: 'POST',
    body: JSON.stringify({ name, email }),
  });

  return customer.id;
}

interface CreatePaymentParams {
  customerId: string;
  value: number;
  description: string;
  externalReference: string;
  installmentCount?: number;
  installmentValue?: number;
  successUrl: string;
}

export async function createPayment(params: CreatePaymentParams): Promise<string> {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);
  const dueDateStr = dueDate.toISOString().split('T')[0];

  const body: Record<string, unknown> = {
    customer: params.customerId,
    billingType: 'UNDEFINED',
    value: params.value,
    dueDate: dueDateStr,
    description: params.description,
    externalReference: params.externalReference,
    callback: {
      successUrl: params.successUrl,
      autoRedirect: true,
    },
  };

  if (params.installmentCount && params.installmentCount > 1) {
    body.installmentCount = params.installmentCount;
    body.installmentValue = params.installmentValue;
  }

  const payment = await asaasFetch('/payments', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  return payment.invoiceUrl;
}
