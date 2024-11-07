import { apiLogin } from './apiRequest-services';
import {mockConteinerServicePesquisar, mockConteinerServiceEditar } from '../utils/mocados'
import AsyncStorage from '@react-native-async-storage/async-storage';


export const logout = async () => {    
    await AsyncStorage.setItem('userToken', '');
}
export const login = async (username, password) => {    
    console.log("login-service");
    
    const user = { username, password };

    try {
        const response = await apiLogin('post', 'token', user);
        
        if (response && response.data.access_token) {
            await AsyncStorage.setItem('userToken', response.data.access_token);
            return response;
        } else {
            throw new Error("Token não recebido. Verifique suas credenciais.");
        }
        
    } catch (error) {
        if (error.response) {
            // Erro de resposta do servidor
            const errorMessage = error.response.data?.Message || 'Erro desconhecido no servidor';
            console.error("Erro do servidor:", errorMessage);
            throw new Error(errorMessage);
        } else if (error.request) {
            // Nenhuma resposta do servidor
            console.error("Erro de rede ou o servidor não respondeu");
            throw new Error('Erro de rede ou o servidor não respondeu');
        } else {
            // Erro na configuração da requisição
            console.error("Erro na configuração da requisição:", error.message);
            const errorMessage = error.message || 'Erro na configuração da requisição';
            console.error("Erro do servidor:", errorMessage);
            throw new Error(errorMessage);
        }
    }
    
    
};

