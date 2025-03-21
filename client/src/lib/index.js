const dev = process.env.REACT_APP_DEV_URL;
const prod = process.env.REACT_APP_PROD_URL;

export const baseURL =
  window.location.hostname.split(":")[0] === "localhost" ||
    window.location.hostname.includes("192")
    ? dev
    : prod;

export const contactDetails = {
  address: '123 Street, New York, USA',
  email: 'info@example.com',
  phone: '+012 345 67890'
}

