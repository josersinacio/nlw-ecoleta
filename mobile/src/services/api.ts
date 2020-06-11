import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.0.102:3333'
});

const ibge = axios.create({
  baseURL: 'https://servicodados.ibge.gov.br/api/v1'
});

export default api;
export { ibge }