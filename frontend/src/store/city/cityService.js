import axios from "axios";

const API_URL = 'http://localhost:8000/api/v1';

export const getAllCities = async () => {
    const response = await axios.get(`${API_URL}/cities`);
        return response.data;
}

export const getTopCitiesByUser = async () => {
    const response = await axios.get(`${API_URL}/users/top-cities`,{
        withCredentials:true
    });
        return response.data;
}

const cityService= {
    getAllCities,
    getTopCitiesByUser,
}


export default cityService;