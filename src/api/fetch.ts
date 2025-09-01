import axios from 'axios';
const API_URL = process.env.NEXT_PUBLIC_ENGINE_URL;
export const options = { headers: { 'content-type': 'application/json' } };

/* Service Instanses */
export const EngineInstanse = axios.create({
  baseURL: API_URL,
});
